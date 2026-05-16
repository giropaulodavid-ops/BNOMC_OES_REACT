import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const AdminVerify = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Read semester and academic_year passed from AdminDashboard via URL query params
    const queryParams = new URLSearchParams(location.search);
    const semester = queryParams.get('semester') || '';
    const academicYear = queryParams.get('academic_year') || '';

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [docStatus, setDocStatus] = useState("Pending");
    const [docNotes, setDocNotes] = useState("");
    const [orNumber, setOrNumber] = useState("");
    const [payAlreadyVerified, setPayAlreadyVerified] = useState(false);

    const docLabels = {
        psa_birth_certificate: 'PSA Birth Certificate',
        recent_picture: '2x2 Recent Picture',
        report_card: 'Report Card / Form 138',
        good_moral: 'Good Moral Certificate',
        esc_voucher: 'ESC/Voucher Certificate',
        honorable_dismissal: 'Honorable Dismissal',
    };

    useEffect(() => {
        // We MUST have the period to fetch the correct data
        if (!semester || !academicYear) {
            setIsLoading(false);
            return;
        }

        const params = new URLSearchParams();
        params.set('semester', semester);
        params.set('academic_year', academicYear);

        // API call now includes the period in the query string to fetch specific payment records
        fetch(`http://localhost:5000/api/admin/verify-details/${id}?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error("Server Error");
                return res.json();
            })
            .then(resData => {
                setData(resData);
                
                // Initialize form values from the database record of THIS specific period
                setDocStatus(resData.doc_ver?.doc_status || "Pending");
                setDocNotes(resData.doc_ver?.admin_notes || "");
                
                const existingOR = resData.payment?.official_receipt || "";
                setOrNumber(existingOR);
                
                // The UI locks if THIS specific period is already verified
                setPayAlreadyVerified(resData.payment?.status === 'Verified');
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setIsLoading(false);
            });
    }, [id, semester, academicYear]);

    const handleAction = async (actionType) => {
        try {
            let endpoint = "";
            let payload = {
                semester: semester,
                academic_year: academicYear
            };

            if (actionType === 'update_doc_status') {
                endpoint = `http://localhost:5000/api/admin/verify-documents/${id}`;
                payload = { ...payload, status: docStatus, notes: docNotes };
            } else if (actionType === 'save_receipt') {
                endpoint = `http://localhost:5000/api/admin/save-receipt/${id}`;
                payload = { ...payload, orNumber: orNumber };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`Successfully updated for ${semester} S.Y. ${academicYear}`);
                window.location.reload();
            } else {
                const errData = await response.json().catch(() => ({}));
                alert("Failed to update: " + (errData.error || 'Unknown Error'));
            }
        } catch (err) {
            console.error("Update Error:", err);
            alert("Server connection error.");
        }
    };

    if (isLoading) return null;
    if (!data) return <div style={{textAlign:'center', marginTop: '50px', color: 'white'}}>Error: No data found for this period.</div>;

    const s = {
        wrapper: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Montserrat', sans-serif" },
        bg: { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: "url('/BNOMC_bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45 },
        header: { position: 'relative', zIndex: 10, background: '#0a4d92', padding: '15px 40px', display: 'flex', alignItems: 'center', gap: '20px', color: 'white' },
        container: { position: 'relative', zIndex: 5, maxWidth: "800px", margin: "30px auto", padding: "0 20px" },
        card: { background: "#0a4d92", borderRadius: "14px", overflow: "hidden", marginBottom: "30px", color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
        cardHeader: { background: "#083d75", padding: "12px 20px", fontWeight: "800", color: "#e6e94e", display: 'flex', justifyContent: 'space-between' },
        row: { padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
        img: { width: "100%", maxWidth: "350px", height: "auto", borderRadius: "10px", border: "4px solid white", marginTop: "10px", cursor: 'pointer' },
        label: { fontWeight: "700", color: "#e6e94e", fontSize: "0.85rem", marginBottom: '8px', display: 'block' },
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
                        <span style={{ color: payAlreadyVerified ? '#4caf50' : '#ff9800', fontSize: '0.8rem' }}>
                            {payAlreadyVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                    </div>

                    <div style={{ ...s.row, background: 'rgba(230, 233, 78, 0.12)', borderBottom: '2px solid #e6e94e' }}>
                        <div style={s.label}>VERIFYING PERIOD:</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
                            {semester} &nbsp;|&nbsp; S.Y. {academicYear}
                        </div>
                    </div>

                    <div style={s.row}>
                        <div style={s.label}>REFERENCE NUMBER (submitted by student):</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#e6e94e' }}>
                            {data.payment?.reference_number || 'No payment submitted yet'}
                        </div>
                    </div>

                    <div style={{ padding: '25px', background: 'rgba(0,0,0,0.1)' }}>
                        <label style={s.label}>OFFICIAL RECEIPT (OR) NUMBER:</label>
                        <input 
                            style={{ 
                                ...s.input, 
                                backgroundColor: payAlreadyVerified ? '#2a2a2a' : '#fff',
                                color: payAlreadyVerified ? '#4caf50' : '#000',
                                cursor: payAlreadyVerified ? 'not-allowed' : 'text',
                                border: payAlreadyVerified ? '1px solid #4caf50' : 'none'
                            }} 
                            value={orNumber} 
                            onChange={(e) => !payAlreadyVerified && setOrNumber(e.target.value)} 
                            placeholder={payAlreadyVerified ? "" : "Enter OR Number..."}
                            readOnly={payAlreadyVerified}
                        />
                        
                        {!payAlreadyVerified ? (
                            <button
                                style={s.saveBtn}
                                onClick={() => handleAction('save_receipt')}
                            >
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
                                ✅ PAYMENT RECORDED — OR: {orNumber}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVerify;