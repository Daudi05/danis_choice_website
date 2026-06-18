import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import {FaFacebook, FaInstagram, FaTwitter} from "react-icons/fa";
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">DANIS<span>CHOICE</span></div>
          <p>Your destination for curated ladies' fashion. Clothes, shoes and bags that celebrate the modern woman.</p>
          <div className="footer-socials">
            <a href="#" className="footer-socials">
              <FaInstagram size={18} />
            </a>

            <a href="#" className="footer-socials">
              <FaFacebook size={18} />
            </a>

            <a href="#" className="footer-socials">
              <FaTwitter size={18} />
            </a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          {[['New Arrivals','/shop'],['Clothes','/shop?category=clothes'],['Shoes','/shop?category=shoes'],['Bags','/shop?category=bags'],['Sale','/shop?sort=price_asc']].map(([l,t])=>(
            <Link key={l} to={t} className="footer-link">{l}</Link>
          ))}
        </div>
        <div>
          <h4>Help</h4>
          {[['About Us','/about'],['Contact','/contact'],['Size Guide','#'],['Returns Policy','#'],['Track Order','/orders']].map(([l,t])=>(
            <Link key={l} to={t} className="footer-link">{l}</Link>
          ))}
        </div>
        <div>
          <h4>Contact</h4>
          
          <div className="footer-contact"><Phone size={14}/><span>+254 112297415</span></div>
          
          <div className="footer-newsletter">
            <p>Subscribe for exclusive drops</p>
            <form className="newsletter-form">
              <input className="form-input" placeholder="Your email" type="email"/>
              <button className="btn btn-primary btn-sm">Join</button>
            </form>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container" style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <span>© 2026 Danis Choice. All rights reserved.</span>
          <span>Crafted with ♥ in Nairobi</span>
        </div>
      </div>
    </footer>
  );
}
