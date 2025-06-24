import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Container } from 'react-bootstrap';

const FIELD_LABELS = {
  name: 'Name',
  title: 'Title',
  company_name: 'Company Name',
  company_description: 'Company Description',
  phone_number: 'Phone Number',
  email: 'Email',
  address: 'Address',
  website: 'Website',
};

const FIELD_ICONS = {
  name: <i className="bi bi-person me-1" />,
  title: <i className="bi bi-briefcase me-1" />,
  company_name: <i className="bi bi-building me-1" />,
  company_description: <i className="bi bi-info-circle me-1" />,
  phone_number: <i className="bi bi-telephone me-1" />,
  email: <i className="bi bi-envelope me-1" />,
  address: <i className="bi bi-geo-alt me-1" />,
  website: <i className="bi bi-globe me-1" />,
};

const FIELD_ORDER = [
  'name',
  'title',
  'company_name',
  'company_description',
  'phone_number',
  'email',
  'address',
  'website',
];

const EXCLUDE_FIELDS = [
  'id', 'image', 'image_url', 'qr_code', 'qrcode', 'qrCode', 'logo', 'created_at'
];

const CardDetail = ({ fetchCards }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`http://localhost:5000/card/${id}`);
        const data = await response.json();
        setCard(data);
      } catch (error) {
        console.error('Error fetching card:', error);
      }
    };
    fetchCard();
  }, [id]);

  const handleEdit = () => {
    navigate(`/add-card?edit=${id}`);
  };

  const handleRetake = () => {
    navigate(`/camera?retake=${id}`);
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/card/${id}`, {
        method: 'DELETE',
      });
      if (fetchCards) fetchCards();
      navigate('/');
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  if (!card) return <div>Loading...</div>;

  // Render card details in a clean, modern, left-aligned layout with icons
  const renderTableDetails = (data) => {
    if (!data) return null;
    // Only use the fields in FIELD_ORDER, in order, and show only if present
    const orderedKeys = FIELD_ORDER.filter(k => data[k]);
    if (orderedKeys.length === 0) return <div className="text-muted">No details available.</div>;
    return (
      <div className="table-responsive mt-3">
        <table className="table table-borderless align-middle mb-0" style={{ background: 'none' }}>
          <tbody>
            {orderedKeys.map((key, idx) => (
              <tr key={key} style={{ borderBottom: idx !== orderedKeys.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <th className="text-nowrap align-top" style={{ width: 170, fontWeight: 600, verticalAlign: 'top', color: '#222', background: 'none', textAlign: 'left', paddingTop: 12, paddingBottom: 8 }}>
                  {FIELD_ICONS[key] || null}
                  {FIELD_LABELS[key]}
                </th>
                <td style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: 16, background: 'none', textAlign: 'left', paddingTop: 12, paddingBottom: 8 }}>{String(data[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Container className="mt-4 mb-5 d-flex justify-content-center">
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Card preview image_url or base64 image, or placeholder */}
        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 120, borderRadius: '1rem', marginBottom: 16 }}>
          {card.image_url ? (
            <img src={card.image_url} alt="Business Card" style={{ maxHeight: 100, maxWidth: '90%', borderRadius: 12, objectFit: 'contain' }} />
          ) : card.image && typeof card.image === 'string' && card.image.length > 100 ? (
            (() => {
              let mime = 'image/jpeg';
              if (card.image.startsWith('/9j/')) mime = 'image/jpeg';
              if (card.image.startsWith('iVBOR')) mime = 'image/png';
              return (
                <img
                  src={`data:${mime};base64,${card.image}`}
                  alt="Card"
                  style={{ maxHeight: 100, maxWidth: '90%', borderRadius: 12, objectFit: 'contain', boxShadow: '0 2px 8px #0001' }}
                />
              );
            })()
          ) : (
            <div className="text-muted text-center w-100">
              <i className="bi bi-card-image" style={{ fontSize: 48 }}></i>
              <div style={{ fontSize: 14 }}>No Card Image</div>
            </div>
          )}
        </div>
        <h4 className="fw-bold mb-3" style={{ textAlign: 'left' }}>Card Details</h4>
        {renderTableDetails(card)}
        <div className="d-flex gap-2 justify-content-center mt-4">
          <Button variant="primary" className="flex-fill d-flex align-items-center justify-content-center gap-2 shadow-sm" onClick={handleEdit}>
            <i className="bi bi-pencil"></i> Edit
          </Button>
          <Button variant="info" className="flex-fill d-flex align-items-center justify-content-center gap-2 shadow-sm text-white" style={{background:'#1976d2'}} onClick={handleRetake}>
            <i className="bi bi-camera"></i> Retake
          </Button>
          <Button variant="danger" className="flex-fill d-flex align-items-center justify-content-center gap-2 shadow-sm" onClick={() => setShowDeleteModal(true)}>
            <i className="bi bi-trash"></i> Delete
          </Button>
        </div>
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Delete Card</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <i className="bi bi-exclamation-triangle text-danger" style={{fontSize:36}}></i>
            <div className="mt-2">Are you sure you want to delete this card?</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default CardDetail;