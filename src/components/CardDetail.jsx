import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, ListGroup, Container, Row, Col, Modal } from 'react-bootstrap';

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

  // Helper to render all card fields in a table layout, with image at top, excluding id and logo
  const renderTableDetails = (data) => {
    if (!data) return null;
    const excludeFields = ['id', 'image', 'image_url', , 'qr_code', 'qrcode', 'qrCode']; // Exclude logo and QR code fields
    const fieldOrder = [
      'name', 'title', 'company_name', 'email', 'phone_number', 'website', 'address', 'mobile', 'created_at'
    ];
    const keys = [
      ...fieldOrder.filter(k => data[k] && !excludeFields.includes(k)),
      ...Object.keys(data).filter(k => !fieldOrder.includes(k) && !excludeFields.includes(k))
    ];
    return (
      <div className="table-responsive mt-3">
        <table className="table table-borderless align-middle mb-0">
          <tbody>
            {keys.map(key => (
              <tr key={key}>
                <th className="text-end text-nowrap align-top" style={{ width: 120, fontWeight: 600, verticalAlign: 'top' }}>
                  {key.replace(/_/g, ' ').replace(/\b([a-z])/g, c => c.toUpperCase())}
                </th>
                <td style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{String(data[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Container className="mt-4 mb-5 d-flex justify-content-center">
      <div style={{ maxWidth: 420, width: '100%' }}>
        <Card className="shadow-lg border-0 rounded-4" style={{ marginTop: 24 }}>
          {/* Card preview image_url or base64 image, or placeholder */}
          <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 120, borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
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
          <Card.Body className="pb-2">
            <h4 className="fw-bold mb-3">Card Details</h4>
            {renderTableDetails(card)}
          </Card.Body>
          <Card.Footer className="bg-white border-0 pt-0 pb-3">
            <div className="d-flex gap-2 justify-content-between">
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
          </Card.Footer>
        </Card>

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