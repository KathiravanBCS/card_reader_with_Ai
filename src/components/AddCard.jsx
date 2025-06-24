import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Form, Container, Row, Col, Modal } from 'react-bootstrap';

const AddCard = ({ fetchCards }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company_name: '',
    phone_number: '',
    email: '',
    website: ''
  });
  const [image, setImage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [cardId, setCardId] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    const retakeId = params.get('retake');

    if (editId || retakeId) {
      const id = editId || retakeId;
      setIsEdit(!!editId);
      setCardId(id);
      fetchCardData(id);
    }
  }, [location]);

  const fetchCardData = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/card/${id}`);
      const data = await response.json();
      setFormData({
        name: data.name || '',
        title: data.title || '',
        company_name: data.company_name || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        website: data.website || ''
      });
    } catch (error) {
      console.error('Error fetching card data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      analyzeImage(file);
    }
  };

  const analyzeImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        name: data.Name || prev.name,
        title: data.Title || prev.title,
        company_name: data['Company Name'] || prev.company_name,
        phone_number: data['Phone Number'] || prev.phone_number,
        email: data.Email || prev.email,
        website: data.Website || prev.website
      }));
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    
    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      Object.keys(dataToSend).forEach(key => {
        formData.append(key, dataToSend[key]);
      });

      try {
        const response = await fetch('http://localhost:5000/analyze', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.id) {
          fetchCards();
          navigate(`/card/${result.id}`);
        }
      } catch (error) {
        console.error('Error saving card:', error);
      }
    } else if (isEdit) {
      try {
        await fetch(`http://localhost:5000/card/${cardId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend)
        });
        fetchCards();
        navigate(`/card/${cardId}`);
      } catch (error) {
        console.error('Error updating card:', error);
      }
    }
  };

  // New: ScanUpload logic (Bootstrap only)
  const handleScanFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      scanImage(file);
    }
  };

  const scanImage = async (file) => {
    setScanLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:5000/analyze', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Server error: ' + res.status);
      const data = await res.json();
      setScanResult(data);
      setScanSuccess(true);
      setFormData(prev => ({
        ...prev,
        name: data.Name || prev.name,
        title: data.Title || prev.title,
        company_name: data['Company Name'] || prev.company_name,
        phone_number: data['Phone Number'] || prev.phone_number,
        email: data.Email || prev.email,
        website: data.Website || prev.website
      }));
    } catch (err) {
      setScanResult({ error: err.message });
    }
    setScanLoading(false);
  };

  const resetScan = () => {
    setImage(null);
    setScanResult(null);
    setScanSuccess(false);
  };

  const renderScanResult = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) {
      return (
        <div>
          {data.map((card, idx) => (
            <div className="card mb-3" key={idx}>
              <div className="card-body">
                <h6 className="card-title mb-2">Card {idx + 1}</h6>
                <ul className="list-group list-group-flush">
                  {Object.entries(card).map(([key, value]) => (
                    <li className="list-group-item px-0 py-1" key={key}>
                      <strong>{key.replace(/_/g, ' ')}: </strong>
                      {typeof value === 'object' && value !== null ? (
                        <pre className="mb-0 d-inline" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{JSON.stringify(value, null, 2)}</pre>
                      ) : (
                        String(value)
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (typeof data === 'object') {
      return (
        <ul className="list-group list-group-flush">
          {Object.entries(data).map(([key, value]) => (
            <li className="list-group-item px-0 py-1" key={key}>
              <strong>{key.replace(/_/g, ' ')}: </strong>
              {typeof value === 'object' && value !== null ? (
                <pre className="mb-0 d-inline" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{JSON.stringify(value, null, 2)}</pre>
              ) : (
                String(value)
              )}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <pre className="bg-light p-2 rounded" style={{ fontSize: 14, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
    );
  };

  return (
    <Container className="mt-3 mb-5">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Button variant="link" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" style={{ fontSize: 24 }}></i>
          </Button>
          <h5 className="mb-0">{isEdit ? 'Edit Card' : 'Add New Card'}</h5>
          <div style={{ width: 24 }}></div>
        </Card.Header>
        <Card.Body>
          {/* ScanUpload UI */}
          {!image && !isEdit && !scanSuccess && (
            <div className="text-center py-4">
              <h5>Upload or Scan the business card</h5>
              <input type="file" accept="image/*" onChange={handleScanFile} className="form-control mb-2" />
              {scanLoading && <div className="mt-2">Scanning...</div>}
            </div>
          )}
          {/* Scan result UI */}
          {!image && !isEdit && scanSuccess && (
            <div className="card p-3 mb-3">
              <div className="alert alert-success mb-2" role="alert">
                Scan successful!
              </div>
              <h6 className="mb-2">Extracted Card Details:</h6>
              {renderScanResult(scanResult)}
              <button className="btn btn-outline-secondary mt-2" onClick={resetScan} type="button">
                Scan Another
              </button>
            </div>
          )}
          {/* Form UI */}
          {(image || isEdit) && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Enter website"
                />
              </Form.Group>

              {image && (
                <div className="mb-3">
                  <p>Selected image: {image.name}</p>
                  <Button variant="outline-secondary" onClick={() => setShowMethodModal(true)}>
                    <i className="bi bi-upload" style={{ fontSize: 18, marginRight: 6 }}></i> Change Image
                  </Button>
                </div>
              )}

              <Button variant="primary" type="submit" className="w-100">
                {isEdit ? 'Update Card' : 'Save Card'}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      <Modal show={showMethodModal} onHide={() => setShowMethodModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3">
            <Button variant="primary" size="lg" onClick={() => {
              document.getElementById('cameraInput').click();
              setShowMethodModal(false);
            }}>
              <i className="bi bi-camera" style={{ fontSize: 20, marginRight: 8 }}></i> Take Photo
            </Button>
            <Button variant="secondary" size="lg" onClick={() => {
              document.getElementById('fileInput').click();
              setShowMethodModal(false);
            }}>
              <i className="bi bi-upload" style={{ fontSize: 18, marginRight: 8 }}></i> Upload Image
            </Button>
          </div>
          <input
            id="cameraInput"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AddCard;