import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminVerify = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [docStatus, setDocStatus] = useState("Pending");
    const [docNotes, setDocNotes] = useState("");
    const [orNumber, setOrNumber] = useState("");

    const docLabels = {
        psa_birth_certificate: 'PSA Birth Certificate',
        recent_picture: '2x2 Recent Picture',
        report_card: 'Report Card / Form 138',
        good_moral: 'Good Moral Certificate',
        esc_voucher: 'ESC/Voucher Certificate',
        honorable_dismissal: 'Honorable Dismissal',
    };

    useEffect(() => {
        fetch(`http://localhost:5000/api/admin/verify-details/${id}`)
            .then(res => res.json())
            .then(resData => {
                setData(resData);
                setDocStatus(resData.doc_ver?.doc_status || "Pending");
                setDocNotes(resData.doc_ver?.admin_notes || "");
                setOrNumber(resData.payment?.official_receipt || "");
                setIsLoading(false);
            })
            .catch(err => console.error(err));
    }, [id]);

    const handleAction = async (actionType) => {
        try {
            let endpoint = "";
            let payload = {};

            if (actionType === 'update_doc_status') {
                endpoint = `http://localhost:5000/api/admin/update-doc-status/${id}`;
                payload = { status: docStatus, notes: docNotes };
            } else if (actionType === 'save_receipt') {
                if (!orNumber) return alert("Please enter an OR Number");
                endpoint = `http://localhost:5000/api/admin/save-receipt/${id}`;
                payload = { orNumber: orNumber };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Updated successfully!");
                // Refresh data to show "Verified" immediately
                window.location.reload(); 
            } else {
                alert("Failed to update.");
            }
        } catch (err) {
            console.error(err);
            alert("Server error.");
        }
    };

    if (isLoading) return null;

    const s = {
        wrapper: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Montserrat', sans-serif" },
        bg: { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: "url('/BNOMC_bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45 },
        header: { position: 'relative', zIndex: 10, background: '#0a4d92', padding: '15px 40px', display: 'flex', alignItems: 'center', gap: '20px', color: 'white' },
        container: { position: 'relative', zIndex: 5, maxWidth: "800px", margin: "30px auto", padding: "0 20px" },
        card: { background: "#0a4d92", borderRadius: "14px", overflow: "hidden", marginBottom: "30px", color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
        cardHeader: { background: "#083d75", padding: "12px 20px", fontWeight: "800", color: "#e6e94e", display: 'flex', justifyContent: 'space-between' },
        row: { padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
        img: { width: "100%", maxWidth: "350px", height: "auto", borderRadius: "10px", border: "4px solid white", marginTop: "10px" },
        label: { fontWeight: "700", color: "#e6e94e", fontSize: "0.85rem", marginBottom: '8px', display: 'block' },
        // Added color: 'black' here so you can see the text/choices
        input: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", marginBottom: "15px", fontWeight: "600", color: 'black', backgroundColor: 'white' },
        saveBtn: { width: "100%", background: "#e6e94e", color: "#073b75", padding: "15px", borderRadius: "10px", fontWeight: "900", border: "none", cursor: 'pointer' }
    };

    return (
        <div style={s.wrapper}>
            <div style={s.bg} />
            <header style={s.header}>
                <img src="/BNOMC_Logo.png" alt="logo" style={{ width: '55px' }} />
                <h1 style={{ fontSize: '1.4rem', fontWeight: '900' }}>BNOMC ONLINE ENROLLMENT SYSTEM</h1>
            </header>

            <div style={s.container}>
                <button onClick={() => navigate('/admin/dashboard')} style={{ background: '#e6e94e', color: '#073b75', border: 'none', padding: '10px 25px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', marginBottom: '20px' }}>← BACK</button>
                
                <h2 style={{ color: '#0a4d92', fontWeight: '900', marginBottom: '25px', textAlign: 'center' }}>
                    VERIFYING: {data.student?.first_name} {data.student?.last_name}
                </h2>

                <div style={s.card}>
                    <div style={s.cardHeader}><span>ENROLLMENT DOCUMENTS</span><span>FILE PREVIEW</span></div>
                    {Object.keys(docLabels).map(key => (
                        <div key={key} style={s.row}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{docLabels[key]}</div>
                            {data.docs?.[key] ? (
                                <img src={`http://localhost:5000/${data.docs[key]}`} alt="Preview" style={s.img} onClick={() => window.open(`http://localhost:5000/${data.docs[key]}`, '_blank')} />
                            ) : <div style={{ color: '#ff9999', fontSize: '0.8rem', marginTop: '10px' }}>Not Uploaded</div>}
                        </div>
                    ))}
                    <div style={{ padding: '25px', background: 'rgba(0,0,0,0.1)' }}>
                        <label style={s.label}>DOCUMENT STATUS:</label>
                        <select style={s.input} value={docStatus} onChange={(e) => setDocStatus(e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <textarea style={{ ...s.input, height: '80px' }} value={docNotes} onChange={(e) => setDocNotes(e.target.value)} placeholder="Admin Notes..." />
                        <button style={s.saveBtn} onClick={() => handleAction('update_doc_status')}>💾 SAVE DOCUMENT STATUS</button>
                    </div>
                </div>

                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <span>PAYMENT VERIFICATION</span>
                        {/* DYNAMIC STATUS TAG */}
                        <span style={{ 
                            color: data.payment?.status === 'Verified' ? '#4caf50' : '#ff9800',
                            fontSize: '0.8rem' 
                        }}>
                            {data.payment?.status?.toUpperCase() || 'PENDING'}
                        </span>
                    </div>
                    
                    <div style={s.row}>
                        <div style={s.label}>REFERENCE NUMBER:</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#e6e94e' }}>
                            {data.payment?.reference_number || "N/A"}
                        </div>
                    </div>

                    <div style={{ padding: '25px', background: 'rgba(0,0,0,0.1)' }}>
                        <label style={s.label}>OFFICIAL RECEIPT (OR) NUMBER:</label>
                        <input 
                            style={{ 
                                ...s.input, 
                                backgroundColor: data.payment?.official_receipt ? '#2a2a2a' : '#fff',
                                color: data.payment?.official_receipt ? '#4caf50' : '#000',
                                cursor: data.payment?.official_receipt ? 'not-allowed' : 'text',
                                border: data.payment?.official_receipt ? '1px solid #4caf50' : 'none'
                            }} 
                            value={orNumber} 
                            onChange={(e) => setOrNumber(e.target.value)} 
                            placeholder={data.payment?.official_receipt ? "" : "Enter OR Number..."}
                            readOnly={!!data.payment?.official_receipt} 
                        />
                        
                        {!data.payment?.official_receipt ? (
                            <button style={s.saveBtn} onClick={() => handleAction('save_receipt')}>
                                💾 SAVE & VERIFY PAYMENT
                            </button>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '10px', 
                                border: '1px solid #4caf50', 
                                borderRadius: '8px',
                                color: '#4caf50',
                                fontWeight: 'bold'
                            }}>
                                ✅ PAYMENT RECORDED PERMANENTLY
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVerify;