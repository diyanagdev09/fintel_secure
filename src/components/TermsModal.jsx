import { Check, X } from 'lucide-react';
export default function TermsModal({open,onClose,onAccept}){
 if(!open)return null;
 return <div className="modal-layer" onMouseDown={onClose}>
  <div className="modal" role="dialog" aria-modal="true" aria-labelledby="terms-title" onMouseDown={e=>e.stopPropagation()}>
   <div className="modal-head"><div><p className="page-kicker">FINTEL SECURE</p><h2 id="terms-title">Terms & Conditions</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={15}/></button></div>
   <div className="modal-body">
    <p>Fintel Secure is a financial data intelligence and research application. Use the platform only with data you are authorized to process.</p>
    <h3>Data and security</h3><p>Uploaded transaction files are processed for analysis, risk scoring and investigation workflows. Do not upload passwords, payment credentials, private keys or other secrets.</p>
    <h3>Risk results</h3><p>Risk scores and anomaly indicators are analytical outputs and may contain false positives or false negatives. Review results before acting on them.</p>
    <h3>Market workspace</h3><p>Stock, IPO, screener and paper-portfolio features are provided for research and educational use and are not a substitute for professional financial advice.</p>
    <h3>Acceptable use</h3><p>You agree not to misuse the platform, attempt unauthorized access, upload malicious content or use the service for unlawful activity.</p>
   </div>
   <div className="modal-foot"><button className="btn" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onAccept||onClose}><Check size={14}/> I agree & continue</button></div>
  </div>
 </div>;
}
