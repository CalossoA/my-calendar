import React, { useState, useEffect } from 'react';
import { getTodos, addTodo, updateTodo, deleteTodo } from './api';
import DayPicker from './DayPicker';
import { WeekView, MonthView } from './CalendarViews';
import { Card, Badge, Modal, Button, Form, Container, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaTrash, FaEdit, FaCheckCircle, FaRegCircle, FaRegCalendarAlt } from 'react-icons/fa';

function Calendar() {
  function formatDate(date) {
    // yyyy-MM-ddTHH:mm formato per datetime-local
    const d = new Date(date);
    const pad = n => n.toString().padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', date: formatDate(new Date()), priority: 'normal' });
  const [viewDate, setViewDate] = useState(formatDate(new Date()));
  const [view, setView] = useState('day');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    setLoading(true);
    getTodos().then(tds => {
      setTodos(tds);
      setLoading(false);
    });
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    if (!newTodo.title) return;
    setLoading(true);
    try {
      const todo = await addTodo({ ...newTodo, done: false });
      setTodos([...todos, todo]);
      setNewTodo({ title: '', description: '', date: viewDate, priority: 'normal' });
      setFeedback({ show: true, message: 'Task aggiunto!', variant: 'success' });
    } catch {
      setFeedback({ show: true, message: 'Errore durante l\'aggiunta.', variant: 'danger' });
    }
    setLoading(false);
  };

  const handleToggle = async todo => {
    setLoading(true);
    try {
      const updated = await updateTodo(todo._id, { done: !todo.done });
      setTodos(todos.map(t => t._id === todo._id ? updated : t));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    setLoading(true);
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t._id !== id));
      setFeedback({ show: true, message: 'Task eliminato.', variant: 'warning' });
    } catch {
      setFeedback({ show: true, message: 'Errore durante l\'eliminazione.', variant: 'danger' });
    }
    setLoading(false);
  };

  const handleEdit = todo => {
    setEditTodo({ ...todo });
    setShowModal(true);
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      const updated = await updateTodo(editTodo._id, editTodo);
      setTodos(todos.map(t => t._id === editTodo._id ? updated : t));
      setShowModal(false);
      setFeedback({ show: true, message: 'Task aggiornato!', variant: 'info' });
    } catch {
      setFeedback({ show: true, message: 'Errore durante la modifica.', variant: 'danger' });
    }
    setLoading(false);
  };

  // Filtri avanzati
  let filtered = todos.filter(t => {
    const matchDate = formatDate(t.date) === viewDate;
    const matchDone = filter === 'all' ? true : filter === 'done' ? t.done : !t.done;
    const matchText = search === '' || t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase());
    return matchDate && matchDone && matchText;
  });

  // Badge colore per priorità
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return <Badge bg="danger" className="ms-2 animate__animated animate__pulse animate__infinite">Alta</Badge>;
      case 'low': return <Badge bg="info" className="ms-2">Bassa</Badge>;
      default: return <Badge bg="secondary" className="ms-2">Normale</Badge>;
    }
  };

  return (
  <Container fluid className="min-vh-100 p-0" style={{background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', fontFamily: 'SF Pro Display, Roboto, Arial, sans-serif'}}>
      <header className="sticky-top shadow-sm" style={{background: 'rgba(255,255,255,0.98)', zIndex: 10, borderBottom: '1px solid #e5e7eb'}}>
        <Container className="py-3">
          <Row className="align-items-center g-2">
            <Col xs="auto">
              <FaRegCalendarAlt size={40} className="text-primary me-2" style={{filter: 'drop-shadow(0 2px 8px #6366f1aa)'}} />
            </Col>
            <Col>
              <h2 className="fw-bold mb-0" style={{letterSpacing: 0.5, fontSize: 28, color: '#222'}}>My Super Calendar</h2>
              <div className="text-muted" style={{fontSize: 16, fontWeight: 500}}>Organizza, colora, conquista la tua giornata!</div>
            </Col>
            <Col xs="auto" className="d-none d-md-block">
              <span className="badge rounded-pill bg-primary bg-gradient shadow px-4 py-2 fs-5" style={{fontWeight: 600, fontSize: 18, letterSpacing: 0.5}}>{filtered.length} task</span>
            </Col>
          </Row>
        </Container>
      </header>
      <Container className="py-4 animate__animated animate__fadeInUp" style={{maxWidth: 900}}>
        <Row className="g-3 mb-4 align-items-center justify-content-between flex-nowrap" style={{overflowX: 'auto'}}>
          <Col xs="auto">
            <Button variant={view==='day' ? 'primary' : 'outline-primary'} onClick={() => setView('day')} className="shadow rounded-pill px-4 py-2 fs-6" style={{fontWeight: 600}}>Giorno</Button>
          </Col>
          <Col xs="auto">
            <Button variant={view==='week' ? 'primary' : 'outline-primary'} onClick={() => setView('week')} className="shadow rounded-pill px-4 py-2 fs-6" style={{fontWeight: 600}}>Settimana</Button>
          </Col>
          <Col xs="auto">
            <Button variant={view==='month' ? 'primary' : 'outline-primary'} onClick={() => setView('month')} className="shadow rounded-pill px-4 py-2 fs-6" style={{fontWeight: 600}}>Mese</Button>
          </Col>
          <Col xs={12} md>
            <InputGroup className="shadow rounded-pill bg-white overflow-hidden">
              <Form.Control placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 bg-white px-4" style={{fontSize: 17}} />
              <Form.Select value={filter} onChange={e => setFilter(e.target.value)} style={{maxWidth: 140, fontSize: 16}} className="border-0 bg-white">
                <option value="all">Tutti</option>
                <option value="done">Completati</option>
                <option value="todo">Da fare</option>
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>
        {feedback.show && <Alert variant={feedback.variant} onClose={() => setFeedback({ ...feedback, show: false })} dismissible className="shadow-sm">{feedback.message}</Alert>}
        <div className="mb-3">
          {view === 'day' && <DayPicker value={viewDate} onChange={setViewDate} />}
          {view === 'week' && <WeekView todos={todos} viewDate={viewDate} onSelectDay={setViewDate} />}
          {view === 'month' && <MonthView todos={todos} viewDate={viewDate} onSelectDay={setViewDate} />}
        </div>
        {loading && <div className="text-center my-3"><Spinner animation="border" variant="primary" /></div>}
  <Row xs={1} md={2} lg={2} className="g-4">
          {filtered.length === 0 && !loading && (
            <Col>
              <div className="text-center py-5 animate__animated animate__fadeIn animate__faster">
                <img src="/logo192.png" alt="Onboarding" style={{width: 80, opacity: 0.7, marginBottom: 16}} />
                <h4 className="fw-bold mt-3 mb-2" style={{color: '#6366f1'}}>Nessun task ancora!</h4>
                <div className="text-muted mb-2" style={{fontSize: 17}}>Aggiungi la tua prima cosa da fare e inizia a organizzare la giornata come un pro.</div>
                <span className="badge rounded-pill px-4 py-2" style={{background: 'linear-gradient(90deg,#6366f1,#a5b4fc)', color: '#fff', fontSize: 16, fontWeight: 500}}>Tocca "Aggiungi" qui sotto</span>
              </div>
            </Col>
          )}
          {filtered.map(todo => (
            <Col key={todo._id} className="animate__animated animate__fadeInUp">
              <Card className={`shadow border-0 h-100 position-relative glass-card ${todo.done ? 'bg-light' : 'bg-white'}`} style={{borderRadius: 24, borderLeft: `8px solid ${todo.priority==='high' ? '#ff375f' : todo.priority==='low' ? '#32ade6' : '#6366f1'}`, transition: 'box-shadow 0.2s, transform 0.2s'}}>
                <Card.Body className="d-flex align-items-start gap-3 p-4 card-body-hover">
                  <Button variant={todo.done ? 'success' : 'outline-secondary'} size="lg" className="mt-1 rounded-circle border-0 btn-checkable" onClick={() => handleToggle(todo)} title={todo.done ? 'Segna come da fare' : 'Segna come completato'} style={{width: 44, height: 44, fontSize: 22, boxShadow: '0 2px 8px #0001', transition: 'background 0.2s, box-shadow 0.2s'}}>
                    {todo.done ? <FaCheckCircle /> : <FaRegCircle />}
                  </Button>
                  <div className="flex-grow-1">
                    <Card.Title as="h5" className={`mb-1 d-flex align-items-center gap-2 ${todo.done ? 'text-decoration-line-through text-muted' : ''}`} style={{fontWeight: 700, fontSize: 22}}>
                      {todo.title}
                      {todo.priority === 'high' && <Badge className="ms-1 px-3 py-2 shadow rounded-pill badge-gradient-high">Alta</Badge>}
                      {todo.priority === 'low' && <Badge className="ms-1 px-3 py-2 shadow rounded-pill badge-gradient-low">Bassa</Badge>}
                      {(!todo.priority || todo.priority === 'normal') && <Badge className="ms-1 px-3 py-2 shadow rounded-pill badge-gradient-normal">Normale</Badge>}
                    </Card.Title>
                    <Card.Text className="mb-2" style={{fontSize: 17, color: '#444'}}>{todo.description}</Card.Text>
                    <div className="d-flex align-items-center gap-2" style={{fontSize: 15}}>
                      <FaRegCalendarAlt className="me-1 text-primary" /> {formatDate(todo.date)}
                      {todo.done && <Badge bg="success" className="ms-2 rounded-pill px-3 py-2">Completato</Badge>}
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2 ms-2">
                    <Button variant="outline-info" size="lg" onClick={() => handleEdit(todo)} title="Modifica" className="shadow rounded-pill border-0 btn-action" style={{fontSize: 20, width: 44, height: 44, transition: 'background 0.2s, box-shadow 0.2s'}}><FaEdit /></Button>
                    <Button variant="outline-danger" size="lg" onClick={() => handleDelete(todo._id)} title="Elimina" className="shadow rounded-pill border-0 btn-action" style={{fontSize: 20, width: 44, height: 44, transition: 'background 0.2s, box-shadow 0.2s'}}><FaTrash /></Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
  <Card className="mt-5 animate__animated animate__fadeInUp shadow border-0 glass-card" style={{maxWidth: 700, margin: '40px auto 0', borderRadius: 24, backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.85)'}}>
          <Card.Body>
            <Form onSubmit={handleAdd} className="row g-4 align-items-end">
              <Col xs={12} md={4}>
                <Form.Group controlId="todoTitle">
                  <Form.Label className="fw-bold" style={{fontSize: 17}}>Titolo</Form.Label>
                  <Form.Control placeholder="Titolo" value={newTodo.title} onChange={e => setNewTodo({...newTodo, title: e.target.value})} required disabled={loading} className="shadow rounded-pill px-4 py-2 border-0" style={{fontSize: 17}} />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="todoDesc">
                  <Form.Label className="fw-bold" style={{fontSize: 17}}>Descrizione</Form.Label>
                  <Form.Control placeholder="Descrizione" value={newTodo.description} onChange={e => setNewTodo({...newTodo, description: e.target.value})} disabled={loading} className="shadow rounded-pill px-4 py-2 border-0" style={{fontSize: 17}} />
                </Form.Group>
              </Col>
              <Col xs={6} md={3}>
                <Form.Group controlId="todoDateTime">
                  <Form.Label className="fw-bold" style={{fontSize: 17}}>Data e ora</Form.Label>
                  <Form.Control type="datetime-local" value={newTodo.date} onChange={e => setNewTodo({...newTodo, date: e.target.value})} disabled={loading} className="shadow rounded-pill px-4 py-2 border-0" style={{fontSize: 17}} />
                </Form.Group>
              </Col>
              <Col xs={6} md={2}>
                <Form.Group controlId="todoPriority">
                  <Form.Label className="fw-bold" style={{fontSize: 17}}>Priorità</Form.Label>
                  <Form.Select value={newTodo.priority} onChange={e => setNewTodo({...newTodo, priority: e.target.value})} disabled={loading} className="shadow rounded-pill px-4 py-2 border-0" style={{fontSize: 17}}>
                    <option value="normal">Normale</option>
                    <option value="high">Alta</option>
                    <option value="low">Bassa</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md="auto">
                <Button type="submit" variant="primary" disabled={loading} className="px-5 py-2 shadow rounded-pill fs-5" style={{fontWeight: 600}}>Aggiungi</Button>
              </Col>
            </Form>
          </Card.Body>
        </Card>

        {/* Modal per modifica task */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Modifica Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editTodo && (
              <Form>
                <Form.Group className="mb-2" controlId="editTitle">
                  <Form.Label className="fw-bold">Titolo</Form.Label>
                  <Form.Control value={editTodo.title} onChange={e => setEditTodo({...editTodo, title: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-2" controlId="editDesc">
                  <Form.Label className="fw-bold">Descrizione</Form.Label>
                  <Form.Control value={editTodo.description} onChange={e => setEditTodo({...editTodo, description: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-2" controlId="editDateTime">
                  <Form.Label className="fw-bold">Data e ora</Form.Label>
                  <Form.Control type="datetime-local" value={formatDate(editTodo.date)} onChange={e => setEditTodo({...editTodo, date: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-2" controlId="editPriority">
                  <Form.Label className="fw-bold">Priorità</Form.Label>
                  <Form.Select value={editTodo.priority || 'normal'} onChange={e => setEditTodo({...editTodo, priority: e.target.value})}>
                    <option value="normal">Normale</option>
                    <option value="high">Alta</option>
                    <option value="low">Bassa</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
            <Button variant="primary" onClick={handleEditSave} disabled={loading}>Salva</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Container>
  );
}

export default Calendar;
