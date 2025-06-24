from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import google.generativeai as genai
import json
import re
from sqlalchemy.orm import Session
from models import Card, SessionLocal
import datetime

app = Flask(__name__)
CORS(app)

GOOGLE_API_KEY = "AIzaSyCdF11Nw8u7eWTwDimxVoe0PVOBXm5jia4"
genai.configure(api_key=GOOGLE_API_KEY)

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image_file = request.files['image']
    image_bytes = image_file.read()
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = (
        "You are a card reader. Extract all possible relevant fields from the card image, including but not limited to: Name, Title, Email, Phone Number, Address, Company Name, Website, Social Media, Logo (describe if present), QR Code (describe if present), and any other contact or identification information. "
        "Return the result as a JSON object with each detected field as a key and its value. If a field is missing, omit it. If you detect a logo or QR code, describe their location and content if possible."
    )
    try:
        response = model.generate_content([
            prompt,
            {"mime_type": image_file.mimetype, "data": image_bytes}
        ])
        text = response.text if hasattr(response, 'text') else str(response)
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            card_data = json.loads(match.group(0))
            main_fields = [
                "Name", "Title", "Company Name", "Phone Number", "Email", "Website"
            ]
            ordered = {field: card_data.get(field) for field in main_fields}
            for k, v in card_data.items():
                if k not in ordered:
                    ordered[k] = v
            # Store in DB
            db: Session = SessionLocal()
            card = Card(
                image=image_bytes,
                name=card_data.get("Name"),
                title=card_data.get("Title"),
                company_name=card_data.get("Company Name"),
                phone_number=card_data.get("Phone Number"),
                email=card_data.get("Email"),
                website=card_data.get("Website"),
                extra_fields=json.dumps({k: v for k, v in card_data.items() if k not in main_fields}),
                created_at=datetime.datetime.utcnow()
            )
            db.add(card)
            db.commit()
            db.refresh(card)
            db.close()
            ordered['id'] = card.id
            return jsonify(ordered)
        else:
            return jsonify({'raw_response': text, 'error': 'Could not extract JSON'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/cards', methods=['GET'])
def get_cards():
    db: Session = SessionLocal()
    # Get query params
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = request.args.get('search', '').strip().lower()

    query = db.query(Card)
    if search:
        query = query.filter(
            (Card.name != None) & (Card.name.ilike(f"%{search}%")) |
            (Card.title != None) & (Card.title.ilike(f"%{search}%")) |
            (Card.company_name != None) & (Card.company_name.ilike(f"%{search}%"))
        )
    total = query.count()
    cards = query.order_by(Card.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    result = []
    possible_fields = [
        'id', 'name', 'title', 'company_name', 'phone_number', 'email', 'website', 'created_at',
        'Address', 'Other', 'Social Media', 'Contact Person', 'Phone Numbers'
    ]
    for card in cards:
        item = {
            'id': card.id,
            'name': card.name,
            'title': card.title,
            'company_name': card.company_name,
            'phone_number': card.phone_number,
            'email': card.email,
            'website': card.website,
            'created_at': card.created_at.isoformat(),
            'image': base64.b64encode(card.image).decode('utf-8') if card.image else None,
        }
        if card.extra_fields:
            try:
                extra = json.loads(card.extra_fields)
                # Remove logo and QR code fields if present
                for k in ['Logo', 'QR Code', 'logo', 'qr_code', 'qrcode', 'qrCode']:
                    if k in extra:
                        del extra[k]
                item.update(extra)
            except Exception:
                pass
        for field in possible_fields:
            if field not in item:
                item[field] = None
        result.append(item)
    db.close()
    has_more = (page * limit) < total
    return jsonify({'cards': result, 'hasMore': has_more, 'total': total})

@app.route('/card/<int:card_id>', methods=['GET'])
def get_card(card_id):
    db: Session = SessionLocal()
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        db.close()
        return jsonify({'error': 'Card not found'}), 404
    item = {
        'id': card.id,
        'name': card.name,
        'title': card.title,
        'company_name': card.company_name,
        'phone_number': card.phone_number,
        'email': card.email,
        'website': card.website,
        'created_at': card.created_at.isoformat(),
        'image': base64.b64encode(card.image).decode('utf-8'),
    }
    if card.extra_fields:
        try:
            item.update(json.loads(card.extra_fields))
        except Exception:
            pass
    db.close()
    return jsonify(item)

@app.route('/card/<int:card_id>', methods=['DELETE'])
def delete_card(card_id):
    db: Session = SessionLocal()
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        db.close()
        return jsonify({'error': 'Card not found'}), 404
    db.delete(card)
    db.commit()
    db.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
