import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function App() {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false });
  const [selectedTable, setSelectedTable] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    guests_count: 2,
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '18:00'
  });
  
  // Feedback States
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      // Test Backend
      const statusRes = await fetch(`${API_URL}/api/status`).catch(() => null);
      if (statusRes && statusRes.ok) {
        setBackendStatus({ loading: false, online: true });
      } else {
        setBackendStatus({ loading: false, online: false });
      }

      // Fetch Tables
      const tablesRes = await fetch(`${API_URL}/api/tables`).catch(() => null);
      if (tablesRes && tablesRes.ok) {
        const data = await tablesRes.json();
        setTables(data);
      }

      // Fetch Bookings
      const bookingsRes = await fetch(`${API_URL}/api/bookings`).catch(() => null);
      if (bookingsRes && bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll status and tables every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTableSelect = (table) => {
    if (table.status === 'occupied') {
      alert(`Table ${table.table_number} is currently occupied.`);
      return;
    }
    setSelectedTable(table);
    setForm(prev => ({
      ...prev,
      guests_count: Math.min(prev.guests_count, table.capacity)
    }));
    setFormError('');
    setFormSuccess('');
  };

  const handleStatusToggle = async (tableId, currentStatus) => {
    const nextStatusMap = {
      'available': 'occupied',
      'occupied': 'available',
      'reserved': 'available'
    };
    const nextStatus = nextStatusMap[currentStatus];

    try {
      const res = await fetch(`${API_URL}/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setFormError('Please select a table from the grid first.');
      return;
    }

    if (form.guests_count > selectedTable.capacity) {
      setFormError(`Guests count cannot exceed table capacity (${selectedTable.capacity} persons).`);
      return;
    }

    setFormError('');
    setFormSuccess('');
    setLoadingAction(true);

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: selectedTable.id,
          ...form
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book table');
      }

      setFormSuccess(`Successfully booked Table ${selectedTable.table_number}!`);
      // Reset form
      setForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        guests_count: 2,
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '18:00'
      });
      setSelectedTable(null);
      fetchData(); // reload data
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: cssStyles}} />

      {/* Header */}
      <header className="glass-header" style={styles.header}>
        <div style={styles.brandContainer}>
          <span style={styles.logoIcon}>🍽️</span>
          <div>
            <h1 style={styles.title}>TABLEBOOK</h1>
            <p style={styles.subtitle}>Modern Table Booking System</p>
          </div>
        </div>

        <div style={styles.statusContainer}>
          <div style={styles.statusIndicator}>
            <span className={`status-dot ${backendStatus.online ? 'active' : 'inactive'}`}></span>
            <span style={styles.statusText}>
              Backend: {backendStatus.loading ? 'Checking...' : backendStatus.online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <button className="btn-refresh" onClick={fetchData} style={styles.refreshBtn}>
            🔄 Sync Data
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main style={styles.mainGrid}>
        
        {/* Left column: Tables layout */}
        <section className="glass-card" style={styles.leftCol}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Restaurant Layout</h2>
            <p style={styles.sectionDesc}>Select an available table to book</p>
          </div>

          <div style={styles.tablesGrid}>
            {tables.map(table => {
              const isSelected = selectedTable && selectedTable.id === table.id;
              return (
                <div
                  key={table.id}
                  className={`table-card status-${table.status} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTableSelect(table)}
                  style={styles.tableCard}
                >
                  <div style={styles.tableNumber}>{table.table_number}</div>
                  <div style={styles.tableCapacity}>👥 Capacity: {table.capacity}</div>
                  <div style={styles.tableLocation}>{table.location}</div>
                  <span className={`table-badge badge-${table.status}`} style={styles.tableBadge}>
                    {table.status.toUpperCase()}
                  </span>
                  
                  {/* Quick Action overlay button to simulate occupancy */}
                  <button 
                    className="btn-status-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(table.id, table.status);
                    }}
                    style={styles.statusToggleBtn}
                    title="Toggle Table Occupancy"
                  >
                    ⚡ Toggle
                  </button>
                </div>
              );
            })}
            {tables.length === 0 && (
              <div style={styles.noData}>No tables configured. Ensure your database is initialized.</div>
            )}
          </div>

          {/* Table Legend */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{...styles.legendColor, backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)'}}></span>
              <span>Available</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{...styles.legendColor, backgroundColor: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.5)'}}></span>
              <span>Reserved</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{...styles.legendColor, backgroundColor: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.5)'}}></span>
              <span>Occupied</span>
            </div>
          </div>
        </section>

        {/* Right column: Form & Bookings List */}
        <section style={styles.rightCol}>
          
          {/* Booking Form */}
          <div className="glass-card" style={styles.formCard}>
            <h2 style={styles.sectionTitle}>
              {selectedTable ? `Book Table ${selectedTable.table_number}` : 'New Reservation'}
            </h2>
            <p style={styles.sectionDesc}>
              {selectedTable 
                ? `Max capacity: ${selectedTable.capacity} persons | ${selectedTable.location}` 
                : 'Click a table on the left to start booking'
              }
            </p>

            <form onSubmit={handleSubmitBooking} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                    disabled={!selectedTable}
                    className="form-input"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 0812345678"
                    required
                    disabled={!selectedTable}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address (Optional)</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleInputChange}
                    placeholder="customer@email.com"
                    disabled={!selectedTable}
                    className="form-input"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Guests Count *</label>
                  <input
                    type="number"
                    name="guests_count"
                    value={form.guests_count}
                    onChange={handleInputChange}
                    min="1"
                    max={selectedTable ? selectedTable.capacity : 10}
                    required
                    disabled={!selectedTable}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Booking Date *</label>
                  <input
                    type="date"
                    name="booking_date"
                    value={form.booking_date}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedTable}
                    className="form-input"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Booking Time *</label>
                  <input
                    type="time"
                    name="booking_time"
                    value={form.booking_time}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedTable}
                    className="form-input"
                  />
                </div>
              </div>

              {formError && <div className="alert-error" style={styles.alertError}>⚠️ {formError}</div>}
              {formSuccess && <div className="alert-success" style={styles.alertSuccess}>🎉 {formSuccess}</div>}

              <button
                type="submit"
                className={`btn-submit ${!selectedTable ? 'disabled' : ''}`}
                disabled={!selectedTable || loadingAction}
                style={styles.submitBtn}
              >
                {loadingAction ? 'Processing Reservation...' : selectedTable ? 'Confirm Reservation' : 'Select a Table to Book'}
              </button>
            </form>
          </div>

          {/* Bookings List */}
          <div className="glass-card" style={styles.bookingsCard}>
            <h2 style={styles.sectionTitle}>Active Reservations</h2>
            <p style={styles.sectionDesc}>Recent booking history loaded from MySQL</p>

            <div className="bookings-list" style={styles.bookingsList}>
              {bookings.map(booking => (
                <div key={booking.id} className="booking-item" style={styles.bookingItem}>
                  <div style={styles.bookingHeader}>
                    <strong style={styles.customerName}>{booking.customer_name}</strong>
                    <span className={`booking-badge badge-${booking.status}`} style={styles.bookingBadge}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={styles.bookingDetails}>
                    <span>📍 <strong>Table {booking.table_number}</strong> ({booking.location})</span>
                    <span>👥 {booking.guests_count} Guests</span>
                    <span>📅 {booking.booking_date.split('T')[0]} @ {booking.booking_time}</span>
                    <span>📞 {booking.customer_phone}</span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div style={styles.noBookings}>No reservations created yet.</div>
              )}
            </div>
          </div>
          
        </section>

      </main>
    </div>
  );
}

// Elegant CSS Styles
const cssStyles = `
  /* Global Styles & Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Glassmorphism Header */
  .glass-header {
    background: rgba(18, 22, 28, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Glassmorphism Card styling */
  .glass-card {
    background: rgba(25, 30, 38, 0.65);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }

  /* Status Dot */
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .status-dot.active {
    background-color: #10b981;
    box-shadow: 0 0 10px #10b981;
  }
  .status-dot.inactive {
    background-color: #ef4444;
    box-shadow: 0 0 10px #ef4444;
  }

  /* Refresh Button */
  .btn-refresh {
    background: rgba(255, 255, 255, 0.05);
    color: #f3f4f6;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .btn-refresh:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.02);
  }

  /* Table Cards */
  .table-card {
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  .table-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  }

  /* Table Card Status Styles */
  .table-card.status-available {
    border-left: 5px solid #10b981;
  }
  .table-card.status-available:hover {
    border-color: #10b981;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
  }
  .table-card.status-reserved {
    border-left: 5px solid #f59e0b;
  }
  .table-card.status-reserved:hover {
    border-color: #f59e0b;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
  }
  .table-card.status-occupied {
    border-left: 5px solid #ef4444;
    opacity: 0.85;
    cursor: not-allowed;
  }

  .table-card.selected {
    border: 2px solid #3b82f6 !important;
    background: rgba(59, 130, 246, 0.1) !important;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3) !important;
  }

  /* Table status toggle button */
  .btn-status-toggle {
    position: absolute;
    bottom: -30px;
    right: 10px;
    background: rgba(255,255,255,0.08);
    color: #cbd5e1;
    border: 1px solid rgba(255,255,255,0.15);
    padding: 2px 6px;
    font-size: 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .table-card:hover .btn-status-toggle {
    bottom: 10px;
  }
  .btn-status-toggle:hover {
    background: #f59e0b;
    color: #0f172a;
    border-color: #f59e0b;
  }

  /* Input fields */
  .form-input {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #f3f4f6;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;
  }
  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    background: rgba(255, 255, 255, 0.08);
  }
  .form-input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Submit button */
  .btn-submit {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    border: none;
    padding: 14px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 15px;
    margin-top: 10px;
  }
  .btn-submit:hover:not(.disabled) {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  .btn-submit.disabled {
    background: #374151;
    color: #9ca3af;
    cursor: not-allowed;
  }

  /* Alerts */
  .alert-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
  }
  .alert-success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: #6ee7b7;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
  }

  /* Booking Item */
  .booking-item {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    padding: 14px;
    transition: all 0.2s ease;
  }
  .booking-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
  }

  /* Badges */
  .table-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 10px;
    padding: 3px 6px;
    border-radius: 4px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .badge-available { background-color: rgba(16, 185, 129, 0.15); color: #34d399; }
  .badge-reserved { background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; }
  .badge-occupied { background-color: rgba(239, 68, 68, 0.15); color: #fca5a5; }

  .booking-badge {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
  }
  .badge-confirmed { background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; }
  .badge-completed { background-color: rgba(16, 185, 129, 0.15); color: #34d399; }
  .badge-cancelled { background-color: rgba(239, 68, 68, 0.15); color: #fca5a5; }
`;

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: '24px',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 28px',
    borderRadius: '16px',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e5e7eb',
  },
  refreshBtn: {
    fontSize: '13px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
    flex: 1,
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    gap: '20px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  cardHeader: {
    marginBottom: '8px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#f3f4f6',
  },
  sectionDesc: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#9ca3af',
  },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
    overflowY: 'auto',
    maxHeight: '520px',
    padding: '4px',
  },
  tableCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px 16px 36px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  tableNumber: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#f3f4f6',
  },
  tableCapacity: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  tableLocation: {
    fontSize: '11px',
    color: '#6b7280',
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '13px',
    color: '#9ca3af',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '4px',
  },
  formCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#d1d5db',
    letterSpacing: '0.5px',
  },
  alertError: {
    marginTop: '4px',
  },
  alertSuccess: {
    marginTop: '4px',
  },
  submitBtn: {
    width: '100%',
  },
  bookingsCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    maxHeight: '220px',
    paddingRight: '6px',
  },
  bookingItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: '14px',
    color: '#f3f4f6',
  },
  bookingBadge: {
    fontSize: '9px',
  },
  bookingDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px 12px',
    fontSize: '12px',
    color: '#9ca3af',
  },
  noData: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  noBookings: {
    textAlign: 'center',
    padding: '24px 0',
    color: '#6b7280',
    fontSize: '13px',
  }
};
