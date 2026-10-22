import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Cross, Minus, Plus, Search, ShoppingBag, ShieldCheck, Trash2, HeartPulse, User, X, Pill, Sparkles, Droplets, Smile, Stethoscope, LayoutGrid } from 'lucide-react';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { customerSupabase } from '../lib/supabase';

const customerAuthErrorMessage = (message: string, action: 'send' | 'verify') => {
  const normalized = message.toLowerCase();
  if (normalized.includes('unsupported phone provider') || normalized.includes('unable to get sms provider') || normalized.includes('phone provider is not configured')) {
    return 'Supabase has no SMS provider configured. In Supabase, open Authentication → Sign In / Providers → Phone, enable phone sign-in, choose a supported SMS provider, add its account credentials, and save. Then try again.';
  }
  if (normalized.includes('invalid phone') || normalized.includes('phone number')) {
    return 'Enter a valid phone number with country code, for example +91 98765 43210.';
  }
  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Too many code requests. Wait a minute, then try again.';
  }
  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'MedPoint could not reach Supabase. Check your internet connection and try again.';
  }
  if (action === 'verify' && (normalized.includes('token') || normalized.includes('otp') || normalized.includes('expired'))) {
    return 'That code is incorrect or expired. Check the latest SMS code and try again, or request a new code.';
  }
  return action === 'send'
    ? `We couldn't send the code. ${message}`
    : `We couldn't verify the code. ${message}`;
};

type Category = 'Medicines' | 'Skin & hygiene' | 'Hair care' | 'Oral care' | 'Medical supplies' | 'Wellness';
interface ShopProduct {
  id: string; name: string; category: Category; description: string; price: number; stock: number;
  image: string; requiresPrescription?: boolean; source: 'medicine' | 'sample';
}
interface CartLine { product: ShopProduct; quantity: number }

const AnimatedDna: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let time = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = Array.from({ length: 1500 }, (_, index) => {
      const strand = index % 2;
      const point = Math.floor(index / 2) / 750;
      const angle = index * 12.9898;
      return {
        strand,
        point,
        offsetX: Math.sin(angle) * (2 + (index % 7) * 1.1),
        offsetY: Math.cos(angle * 1.7) * 4,
        radius: 0.45 + ((index * 17) % 12) / 10,
        opacity: 0.12 + ((index * 29) % 70) / 100,
        phase: index * 0.41,
      };
    });
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      if (!width || !height) resize();
      context.clearRect(0, 0, width, height);
      const center = width * 0.54;
      const amplitude = width * 0.27;
      const twist = Math.PI * 5.2;
      const yOf = (point: number) => 10 + point * (height - 20);
      const xOf = (point: number, strand: number) => center + Math.sin(point * twist + time + strand * Math.PI) * amplitude;

      const glow = context.createRadialGradient(center, height * 0.48, 2, center, height * 0.48, width * 0.43);
      glow.addColorStop(0, 'rgba(184, 118, 235, 0.12)');
      glow.addColorStop(1, 'rgba(184, 118, 235, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i <= 48; i += 1) {
        const point = i / 48;
        const x1 = xOf(point, 0);
        const x2 = xOf(point, 1);
        const y = yOf(point);
        const alpha = 0.13 + (Math.sin(point * twist + time) + 1) * 0.08;
        context.beginPath();
        context.moveTo(x1, y);
        context.lineTo(x2, y);
        context.strokeStyle = `rgba(162, 105, 211, ${alpha})`;
        context.lineWidth = 0.7;
        context.stroke();
      }

      particles.forEach((particle) => {
        const x = xOf(particle.point, particle.strand) + particle.offsetX + Math.sin(time * 1.6 + particle.phase) * 2.2;
        const y = yOf(particle.point) + particle.offsetY + Math.cos(time + particle.phase) * 1.8;
        const pulse = 0.55 + (Math.sin(time * 1.7 + particle.phase) + 1) * 0.23;
        context.beginPath();
        context.arc(x, y, particle.radius * pulse, 0, Math.PI * 2);
        context.fillStyle = particle.strand ? `rgba(224, 118, 211, ${particle.opacity * pulse})` : `rgba(130, 78, 207, ${particle.opacity * pulse})`;
        context.fill();
      });

      if (!reducedMotion) {
        time += 0.014;
        frame = window.requestAnimationFrame(draw);
      }
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
};

const sampleProducts: ShopProduct[] = [
  { id: 'apollo-glucose-kit', name: 'Smart Blood Glucose Monitoring System', category: 'Medical supplies', description: 'Bluetooth glucometer with 25 test strips and 10 lancets', price: 674.10, stock: 8, image: 'https://images.apollo247.in/pub/media/catalog/product/a/p/apb0065_mar_31st_2_.jpg?tr=q-80', source: 'sample' },
  { id: 'apollo-handwash', name: 'Premium Aqua Blue Handwash', category: 'Skin & hygiene', description: '500 ml · twin pack (2 × 250 ml)', price: 144, stock: 20, image: 'https://images.apollo247.in/pub/media/catalog/product/a/p/aph0002-02_1.jpg?tr=q-80', source: 'sample' },
  { id: 'apollo-vitamin-d3', name: 'Vitamin D3 60000 IU', category: 'Wellness', description: 'Pack of 4 capsules · use as directed by a doctor', price: 101.70, stock: 15, image: 'https://images.apollo247.in/pub/media/catalog/product/a/p/apv0019_april_13th_1_.jpg?tr=q-80', source: 'sample' },
  { id: 'apollo-omega-3', name: 'Omega-3 Fish Oil 1000 mg', category: 'Wellness', description: 'Bottle of 30 capsules', price: 224.10, stock: 12, image: 'https://images.apollo247.in/pub/media/catalog/product/a/p/apo0077_april_13th_1_.jpg?tr=q-85', source: 'sample' },
  { id: 'apollo-first-aid', name: 'First Aid Kit', category: 'Medical supplies', description: 'Essential first-aid items for home and travel', price: 450, stock: 7, image: 'https://images.apollo247.in/pub/media/catalog/product/a/p/apf0003-_1_.jpg?tr=q-80', source: 'sample' },
  { id: 'apollo-infrared-thermometer', name: 'Non-Contact Infrared Thermometer', category: 'Medical supplies', description: 'Non-contact temperature checking device', price: 831.70, stock: 6, image: 'https://images.apollo247.in/pub/media/catalog/product/a/p/apn0025-01.jpg?tr=q-80', source: 'sample' },
  { id: 'apollo-digital-thermometer', name: 'Digital Thermometer', category: 'Medical supplies', description: 'Digital thermometer for home temperature checks', price: 98.50, stock: 10, image: 'https://images.apollo247.in/pub/media/catalog/product/a/p/apt0020.jpeg?tr=q-80', source: 'sample' },
  { id: 'skin-skarfix-plus', name: 'Fixderma Skarfix-Plus Hyperpigmentation Cream', category: 'Skin & hygiene', description: '15 g · hyperpigmentation care', price: 300, stock: 12, image: 'https://cdn01.pharmeasy.in/dam/products_otc/A12026/fixderma-2-kojic-acid-1-arbutin-skarfix-plus-scar-removal-cream-helps-to-reduce-melasma-15-g-6.1-1716534465.jpg', source: 'sample' },
  { id: 'skin-excela-moisturiser', name: 'Cipla Excela Moisturiser', category: 'Skin & hygiene', description: '50 g · for oily and acne-prone skin', price: 475, stock: 10, image: 'https://cdn.shopify.com/s/files/1/0594/0297/7442/files/Excelamoisturiser50g_3000x-Photoroom.png?v=1756446361', source: 'sample' },
  { id: 'skin-minimalist-vitamin-c', name: 'Minimalist 10% Vitamin C Face Serum', category: 'Skin & hygiene', description: '30 ml face serum', price: 389, stock: 10, image: 'https://prithvimart.com/cdn/shop/products/717Kb7GUFyL._SL1500_-removebg-preview_1_5000x_33279f01-2584-4661-9820-f45f81268c34.png?v=1659944443', source: 'sample' },
  { id: 'skin-cetaphil-cream', name: 'Cetaphil Moisturising Cream', category: 'Skin & hygiene', description: '50 g · for dry skin', price: 440, stock: 12, image: 'https://medias.watsons.com.my/publishing/WTCMY-BP_19359-front-zoom.jpg?version=1775509858', source: 'sample' },
  { id: 'skin-acmist-cream', name: 'Brinton Acmist Moisturising Cream', category: 'Skin & hygiene', description: '50 g · for acne-prone skin', price: 375, stock: 10, image: 'https://www.clinikally.com/cdn/shop/files/Acmistmousturisingcreamgel50g.jpg?v=1699424954&width=1000', source: 'sample' },
  { id: 'wash-bodywise-benzoyl', name: 'Be Bodywise 2.5% Benzoyl Peroxide Body Wash', category: 'Skin & hygiene', description: '250 ml body wash', price: 260, stock: 14, image: 'https://images-static.nykaa.com/media/catalog/product/d/d/dd93184BEBOD00000357_1.jpg', source: 'sample' },
  { id: 'wash-chemist-play', name: 'Chemist At Play 4% Exfoliating Body Wash', category: 'Skin & hygiene', description: '236 ml body wash', price: 360, stock: 12, image: 'https://innovist.com/cdn/shop/files/HPS_SS_bcde1bfc-c825-4667-8dcb-f0c211ddf8f0.jpg?v=1765358168&width=1080', source: 'sample' },
  { id: 'wash-dermaco-salicylic', name: 'The Derma Co 1% Salicylic Acid Exfoliating Wash', category: 'Skin & hygiene', description: '250 ml daily exfoliating body wash', price: 325, stock: 14, image: 'https://cdn.klassy.com.bd/uploads/products/products/The-Derma-Co-1percent-Salicylic-Acid-Daily-Exfoliating-Body-Wash-250ml-0382-products.webp', source: 'sample' },
  { id: 'soap-ketocip', name: 'Ketocip Ketoconazole Medicated Soap', category: 'Skin & hygiene', description: '75 g medicated soap', price: 125, stock: 10, image: 'https://images.apollo247.in/pub/media/catalog/product/k/e/ket0655_3.jpg?tr=q-80', source: 'sample' },
  { id: 'soap-skinology', name: 'Skinology Prickly Heat Medicated Soap', category: 'Skin & hygiene', description: '75 g medicated soap', price: 105, stock: 10, image: '', source: 'sample' },
  { id: 'medicine-volini-gel', name: 'Volini Pain Relief Gel', category: 'Medicines', description: '75 g topical pain relief gel', price: 260, stock: 16, image: 'https://images.apollo247.in/pub/media/catalog/product/v/o/vol0123_1-may23_3_.jpg', source: 'sample' },
  { id: 'medicine-liv52-ds', name: 'Himalaya Liv.52 DS Tablets', category: 'Medicines', description: 'Bottle of 60 tablets', price: 180, stock: 14, image: 'https://himalayawellness.eu/cdn/shop/files/0_HIMALAYALIV52DS_AMAZONcopy_3280420e-2896-4284-95d4-2946a399725d.jpg?v=1775643404', source: 'sample' },
  { id: 'medicine-zincovit', name: 'Zincovit Tablets', category: 'Medicines', description: 'Strip of 15 tablets', price: 110, stock: 18, image: 'https://cdn.nmz5.de/v2/plain-cake-860195/netmed/wrkr/products/assets/item/free/original/p0ZZIhWC5Z-zincovit_tablet_15s_2_0.jpg', source: 'sample' },
  { id: 'medicine-dolo-650', name: 'Dolo 650 Tablets', category: 'Medicines', description: 'Strip of 15 tablets', price: 33, stock: 20, image: 'https://image.cdn.shpy.in/82900/1657277437590_SKU-0875_0.png?format=webp&width=600', source: 'sample' },
  { id: 'medicine-electral-ors', name: 'Electral ORS Powder', category: 'Medicines', description: '21.8 g sachet', price: 20, stock: 25, image: 'https://cdn.grofers.com/cdn-cgi/image/f%3Dauto%2Cfit%3Dscale-down%2Cq%3D85%2Cmetadata%3Dnone%2Cw%3D480%2Ch%3D480/app/images/products/full_screen/pro_475170.jpg?ts=1685980260', source: 'sample' },
  { id: 'nutrition-ritebite-fruit-nut', name: 'RiteBite Max Protein Daily Fruit & Nut Bar', category: 'Wellness', description: 'Pack of 6 bars', price: 440, stock: 12, image: 'https://assets.hyugalife.com/catalog/product/f/l/flp020_1-4_afdcvxioskjcnjek.jpg', source: 'sample' },
  { id: 'nutrition-yogabar-blueberry', name: 'Yoga Bar Blueberry Blast Daily Protein Bar', category: 'Wellness', description: 'Pack of 6 bars', price: 390, stock: 12, image: 'https://assets.hyugalife.com/catalog/product/3/0/300g-blueberry-blast-10g-box_front.jpg', source: 'sample' },
  { id: 'nutrition-muscleblaze-bar', name: 'MuscleBlaze Fuel One Protein Bar', category: 'Wellness', description: 'Pack of 6 bars', price: 410, stock: 10, image: '', source: 'sample' },
  { id: 'nutrition-amul-lassi', name: 'Amul High Protein Lassi', category: 'Wellness', description: '200 ml tetra pack · pack of 4', price: 110, stock: 18, image: '', source: 'sample' },
  { id: 'nutrition-ensure-drink', name: 'Ensure High Protein Drink', category: 'Wellness', description: '200 ml ready-to-drink bottle', price: 120, stock: 12, image: '', source: 'sample' },
  { id: 'device-morepen-thermometer', name: 'Dr. Morepen DigiClassic Digital Thermometer', category: 'Medical supplies', description: 'Digital clinical thermometer', price: 245, stock: 10, image: '', source: 'sample' },
  { id: 'device-hicks-thermometer', name: 'Hicks Digital Waterproof Thermometer', category: 'Medical supplies', description: 'Waterproof digital thermometer', price: 200, stock: 10, image: 'https://images.apollo247.in/pub/media/catalog/product/d/i/dig0283_1.jpg?tr=q-80%2Cf-webp%2Cw-400%2Cdpr-3%2Cc-at_max+400w', source: 'sample' },
  { id: 'device-hansaplast-bandage', name: 'Hansaplast Cotton Crepe Bandage', category: 'Medical supplies', description: '10 cm × 4 m cotton crepe bandage', price: 230, stock: 14, image: 'https://images.apollo247.in/pub/media/catalog/product/H/A/HAN0140_2-JULY23_1.jpg', source: 'sample' },
  { id: 'device-dynamik-tape', name: 'Dynamik Kinesiology Sports Recovery Tape', category: 'Medical supplies', description: 'Sports muscle recovery tape', price: 375, stock: 10, image: '', source: 'sample' },
  { id: 'device-flamingo-gel-bag', name: 'Flamingo Orthopaedic Heating Gel Bag', category: 'Medical supplies', description: 'Reusable hot and cold gel bag', price: 425, stock: 8, image: '', source: 'sample' },
];
const categories: Array<'All' | Category> = ['All', 'Medicines', 'Skin & hygiene', 'Hair care', 'Oral care', 'Medical supplies', 'Wellness'];
const sampleProductById = new Map(sampleProducts.map((product) => [product.id, product] as const));

export const CustomerShop: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | Category>('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loginForCheckout, setLoginForCheckout] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  useEffect(() => {
    if (!customerSupabase) return;
    let live = true;
    customerSupabase.auth.getSession().then(({ data, error }) => {
      if (!live || error || !data.session?.user.phone) return;
      setCustomerPhone(data.session.user.phone);
      setSignedIn(true);
    });
    const { data: { subscription } } = customerSupabase.auth.onAuthStateChange((_event, session) => {
      if (!live) return;
      setSignedIn(Boolean(session?.user.phone));
      if (session?.user.phone) setCustomerPhone(session.user.phone);
    });
    return () => {
      live = false;
      subscription.unsubscribe();
    };
  }, []);
  const requestCustomerOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage('');
    if (!customerSupabase) {
      setAuthMessage('Customer sign-in is unavailable because Supabase is not configured for this app.');
      return;
    }
    const enteredPhone = customerPhone.trim().replace(/[\s()-]/g, '');
    const normalizedPhone = /^\d{10}$/.test(enteredPhone)
      ? `+91${enteredPhone}`
      : /^91\d{10}$/.test(enteredPhone)
        ? `+${enteredPhone}`
        : enteredPhone;
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setAuthMessage('Enter a valid phone number with country code, for example +91 98765 43210.');
      return;
    }
    setAuthBusy(true);
    try {
      const { error } = await customerSupabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: { data: { account_type: 'customer' } },
      });
      if (error) {
        setAuthMessage(customerAuthErrorMessage(error.message, 'send'));
        return;
      }
      setCustomerPhone(normalizedPhone);
      setOtpSent(true);
    } catch (error) {
      setAuthMessage(customerAuthErrorMessage(error instanceof Error ? error.message : 'Network error', 'send'));
    } finally {
      setAuthBusy(false);
    }
  };
  const verifyCustomerOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage('');
    if (!customerSupabase) return;
    setAuthBusy(true);
    try {
      const { error } = await customerSupabase.auth.verifyOtp({ phone: customerPhone, token: otp, type: 'sms' });
      if (error) {
        setAuthMessage(customerAuthErrorMessage(error.message, 'verify'));
        return;
      }
      setSignedIn(true);
      setShowLogin(false);
      setOtpSent(false);
      setOtp('');
      if (loginForCheckout) {
        setShowCart(false);
        setShowCheckout(true);
      }
      setLoginForCheckout(false);
    } catch (error) {
      setAuthMessage(customerAuthErrorMessage(error instanceof Error ? error.message : 'Network error', 'verify'));
    } finally {
      setAuthBusy(false);
    }
  };
  const products = useMemo<ShopProduct[]>(() => {
    const medicines: ShopProduct[] = INITIAL_PRODUCTS.map((medicine) => {
      const shopDetails = sampleProductById.get(medicine.id);
      return {
        id: medicine.id, name: medicine.name, category: shopDetails?.category || 'Medicines',
        description: shopDetails?.description || `${medicine.genericName} · ${medicine.form} · ${medicine.dosage}`,
        price: medicine.price, stock: medicine.stock, image: shopDetails?.image || '',
        requiresPrescription: medicine.requiresPrescription, source: 'medicine' as const,
      };
    }).filter((item) => item.stock > 0);
    const inventoryIds = new Set(medicines.map((medicine) => medicine.id));
    const catalog = [...medicines, ...sampleProducts.filter((product) => !inventoryIds.has(product.id))];
    const term = search.trim().toLowerCase();
    return catalog.filter((item) => (category === 'All' || item.category === category) && (!term || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(term)));
  }, [search, category]);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const add = (product: ShopProduct) => setCart((previous) => {
    const existing = previous.find((line) => line.product.id === product.id);
    return existing
      ? previous.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) } : line)
      : [...previous, { product, quantity: 1 }];
  });
  const updateQuantity = (productId: string, delta: number) => setCart((previous) => previous
    .map((line) => line.product.id === productId ? { ...line, quantity: line.quantity + delta } : line)
    .filter((line) => line.quantity > 0));

  return <div className="customer-shop min-h-screen bg-slate-50 text-slate-900">
    <header className="customer-shop-header shop-header-enter sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <a href="#top" className="flex items-center gap-3" aria-label="MedPoint home"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white"><Cross size={20}/></span><div><p className="font-bold tracking-tight text-slate-900">MedPoint</p><p className="text-xs text-slate-500">Your neighbourhood pharmacy</p></div></a>
        <nav className="shop-main-nav hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex"><a href="#top" className="hover:text-teal-700">Home</a><a href="#about" className="hover:text-teal-700">About us</a><a href="#categories" className="hover:text-teal-700">Categories</a><a href="#products" className="hover:text-teal-700">Products</a><a href="#contact" className="hover:text-teal-700">Contact</a></nav>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLoginForCheckout(false); setOtpSent(false); setOtp(''); setAuthMessage(''); setShowLogin(true); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800"><User size={17}/><span className="hidden sm:inline">{signedIn ? customerPhone : 'Login'}</span></button>
          <button aria-label={`Open basket, ${itemCount} items`} onClick={() => setShowCart(!showCart)} className="relative inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"><ShoppingBag size={17}/><span className="shop-action-label">Basket</span><span className="rounded-full bg-white/20 px-1.5 text-xs">{itemCount}</span></button>
        </div>
      </div>
      <nav className="shop-mobile-nav" aria-label="Shop sections">
        <a href="#top">Home</a><a href="#about">About</a><a href="#categories">Categories</a><a href="#products">Products</a><a href="#contact">Contact</a>
      </nav>
    </header>
    <main className="mx-auto max-w-7xl space-y-8 px-5 py-7 sm:py-10">
      <section id="top" className="shop-hero-enter pharmacy-hero relative isolate overflow-hidden rounded-[28px] border border-slate-100 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <div className="pharmacy-hero-copy"><span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-teal-800"><HeartPulse size={14}/>YOUR NEIGHBOURHOOD PHARMACY</span>
          <h1 className="shop-title-enter mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">Better health,<br className="hidden sm:block"/> brighter future.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Shop pharmacy essentials, personal care and wellness products for your everyday needs.</p>
          <div className="shop-trust-points"><span><ShieldCheck size={17}/>Trusted everyday care</span><span><Stethoscope size={17}/>Pharmacist support</span><span><HeartPulse size={17}/>Wellness essentials</span></div>
          <div className="relative mt-6 max-w-xl"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines and health essentials" className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"/></div>
          <a href="#catalog" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-800">Explore products <span aria-hidden="true">↗</span></a>
        </div>
        <div className="pharmacy-hero-photo"><img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1200&q=85" alt="Doctor speaking with a patient"/><div className="pharmacy-photo-caption"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white"><Cross size={20}/></span><span><strong>MedPoint Pharmacy</strong><small>Everyday care, close to home</small></span></div></div>
      </section>
      <div className="shop-preview-note flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span><strong>Shop preview:</strong> products, photos, prices and stock are sample data. Phone sign-in needs Supabase Phone Auth and an SMS provider; online order placement is not connected yet.</span><span className="inline-flex items-center gap-1 text-xs font-semibold"><ShieldCheck size={15}/>Preview only</span></div>
      <section id="about" className="pharmacy-about-card">
        <div className="pharmacy-about-art"><img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=85" alt="Everyday pharmacy medicines and health essentials" loading="lazy"/><span className="about-photo-badge"><Cross size={17}/>Care you can count on</span></div>
        <div className="pharmacy-about-copy"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">About MedPoint</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Committed to everyday care.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Find medicines, personal care, wellness and home health essentials in one convenient place. Need a prescription product? Our catalogue will guide you to ask a pharmacist.</p><a href="#catalog" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">Browse categories <span aria-hidden="true">↗</span></a></div>
      </section>
      <section id="catalog" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Explore the catalogue</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Shop by category</h2></div><button onClick={() => setCategory('All')} className="text-sm font-semibold text-teal-800 hover:underline">View all products</button></div>
        <div id="categories" className="shop-category-grid">{categories.map((item) => { const Icon = item === 'All' ? LayoutGrid : item === 'Medicines' ? Pill : item === 'Skin & hygiene' ? Sparkles : item === 'Hair care' ? Droplets : item === 'Oral care' ? Smile : item === 'Medical supplies' ? Stethoscope : HeartPulse; return <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`shop-category-tile ${category === item ? 'is-selected' : ''}`}><span className="shop-category-icon"><Icon size={20}/></span><span className="shop-category-copy"><strong>{item === 'All' ? 'All products' : item}</strong><small>Browse collection</small></span><span className="shop-category-arrow" aria-hidden="true">↗</span></button>; })}</div>
        <div className="shop-benefits-strip"><div><span><Pill size={18}/></span><p><strong>Everyday medicines</strong><small>Helpful essentials</small></p></div><div><span><Sparkles size={18}/></span><p><strong>Personal care</strong><small>For your daily routine</small></p></div><div><span><HeartPulse size={18}/></span><p><strong>Wellness</strong><small>Daily health support</small></p></div><div><span><Stethoscope size={18}/></span><p><strong>Home health</strong><small>Care and comfort at home</small></p></div></div>
        <div id="products" className="flex flex-wrap items-end justify-between gap-3 pt-2"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Curated for your care</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{category === 'All' ? 'Featured products' : category}</h2></div><p className="text-sm text-slate-500">{products.length} products</p></div>
        <div className="shop-featured-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => <article key={product.id} style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }} className="customer-product-card shop-card-enter group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5">
            {product.image && <div className="relative h-48 overflow-hidden bg-slate-50"><img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">{product.category}</span>{product.requiresPrescription && <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">Prescription required</span>}</div>}
            <div className="flex flex-1 flex-col p-4">{!product.image && <div className="mb-3 flex items-center justify-between gap-2"><span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{product.category}</span>{product.requiresPrescription && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">Prescription required</span>}</div>}<h3 className="font-semibold leading-5 text-slate-900">{product.name}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{product.description}</p><div className="mt-auto flex items-center justify-between gap-2 pt-4"><strong className="text-lg text-teal-800">₹{product.price.toFixed(2)}</strong>{product.requiresPrescription ? <span className="max-w-28 text-right text-xs text-slate-500">Ask pharmacist</span> : <button onClick={() => add(product)} className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100"><Plus size={15}/>Add</button>}</div></div>
          </article>)}
          {products.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No products match. Try another search or category.</p>}
        </div>
      </section>
    </main>
      <footer id="contact" className="pharmacy-footer">
        <div className="pharmacy-footer-main"><div className="pharmacy-footer-brand"><a href="#top" className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white"><Cross size={22}/></span><span><strong>MedPoint</strong><small>Your neighbourhood pharmacy</small></span></a><p>Everyday pharmacy, personal care and wellness essentials in one convenient shop.</p></div><div className="pharmacy-footer-links"><strong>Shop</strong><a href="#top">Home</a><a href="#categories">Shop by category</a><a href="#products">Featured products</a></div><div className="pharmacy-footer-links"><strong>Care information</strong><a href="#about">About MedPoint</a><a href="#catalog">Prescription products</a><span>Ask a pharmacist when a product requires prescription review.</span></div><div className="pharmacy-footer-links"><strong>Shop preview</strong><span>Prices, stock and product details are demonstration data.</span><span>Phone sign-in requires Supabase Phone Auth and an SMS provider.</span><span>Online order placement is not connected yet.</span></div></div>
        <div className="pharmacy-footer-bottom"><span>© {new Date().getFullYear()} MedPoint</span><span>Prescription medicines require pharmacist review. Product images are illustrative.</span></div>
      </footer>
    {showCart && <div className="shop-overlay-enter fixed inset-0 z-40 flex justify-end bg-slate-900/40" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCart(false); }}>
      <aside className="shop-cart-panel-enter flex h-full w-full max-w-md flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 className="font-semibold text-slate-900">Your basket</h2><p className="mt-1 text-xs text-slate-500">{cart.length} item type(s)</p></div><button onClick={() => setShowCart(false)} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Close</button></div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">{cart.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Your basket is empty.</p> : cart.map((line) => <div key={line.product.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{line.product.name}</p><p className="mt-1 text-xs text-slate-500">₹{line.product.price.toFixed(2)} each</p></div><div className="flex items-center gap-2"><button aria-label="Remove one" onClick={() => updateQuantity(line.product.id, -1)} className="rounded-md border p-1"><Minus size={14}/></button><span className="w-4 text-center text-sm">{line.quantity}</span><button aria-label="Add one" onClick={() => updateQuantity(line.product.id, 1)} className="rounded-md border p-1"><Plus size={14}/></button><button aria-label="Remove item" onClick={() => setCart((previous) => previous.filter((item) => item.product.id !== line.product.id))} className="ml-1 p-1 text-rose-600"><Trash2 size={15}/></button></div></div>)}</div>
        <div className="space-y-3 border-t border-slate-200 p-5"><div className="flex justify-between font-semibold text-slate-900"><span>Estimated total</span><span>₹{total.toFixed(2)}</span></div><button disabled={cart.length === 0} onClick={() => { setShowCart(false); if (signedIn) setShowCheckout(true); else { setLoginForCheckout(true); setShowLogin(true); } }} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">{signedIn ? 'Continue to checkout' : 'Login to continue'}</button><p className="text-xs leading-5 text-slate-500">Sign-in is a local preview only. Secure phone verification, live stock, payment and order placement require the shared store backend. Prescription products require pharmacist review.</p></div>
      </aside>
    </div>}
    {showLogin && <div className="shop-overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowLogin(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="customer-login-title" className="shop-modal-enter w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-start justify-between"><div><span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><User size={21}/></span><h2 id="customer-login-title" className="mt-4 text-2xl font-bold text-slate-900">Login with mobile</h2><p className="mt-1 text-sm text-slate-500">{otpSent ? `Enter the one-time code for ${customerPhone}.` : 'We’ll use your mobile number to sign you in.'}</p></div><button aria-label="Close login" onClick={() => setShowLogin(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div>
        {!otpSent ? <form onSubmit={requestCustomerOtp} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Mobile number<input required type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} autoComplete="tel" placeholder="+91 98765 43210" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 !text-black caret-black outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">We’ll send a one-time code by SMS. Phone sign-in must be enabled and an SMS provider configured in Supabase.</div>
          {authMessage && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{authMessage}</p>}
          <button type="submit" disabled={authBusy} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">{authBusy ? 'Sending…' : 'Send OTP'}</button>
        </form> : <form onSubmit={verifyCustomerOtp} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">One-time password<input required type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} autoComplete="one-time-code" placeholder="Enter 6-digit OTP" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 !text-black caret-black tracking-[0.3em] outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></label>
          {authMessage && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{authMessage}</p>}
          <button type="submit" disabled={authBusy} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">{authBusy ? 'Verifying…' : 'Verify and continue'}</button>
          <button type="button" disabled={authBusy} onClick={() => { setOtpSent(false); setAuthMessage(''); }} className="w-full py-2 text-sm font-semibold text-slate-600 hover:text-teal-800">Change mobile number</button>
        </form>}
      </section>
    </div>}
    {showCheckout && <div className="shop-overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCheckout(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="shop-modal-enter w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Checkout preview</p><h2 id="checkout-title" className="mt-2 text-2xl font-bold text-slate-900">Delivery details</h2><p className="mt-1 text-sm text-slate-500">Mobile verified: {customerPhone}</p></div><button aria-label="Close checkout" onClick={() => setShowCheckout(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Full name<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoComplete="name" placeholder="Name for delivery" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></label><label className="text-sm font-medium text-slate-700">Mobile number<input readOnly value={customerPhone} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500"/></label><label className="text-sm font-medium text-slate-700 sm:col-span-2">Delivery address<input required value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} autoComplete="street-address" placeholder="House / street / area" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></label><label className="text-sm font-medium text-slate-700">City<input required value={deliveryCity} onChange={(event) => setDeliveryCity(event.target.value)} autoComplete="address-level2" placeholder="City" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></label><label className="text-sm font-medium text-slate-700">PIN code<input required inputMode="numeric" maxLength={6} value={deliveryPincode} onChange={(event) => setDeliveryPincode(event.target.value.replace(/\D/g, '').slice(0, 6))} autoComplete="postal-code" placeholder="6-digit PIN code" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></label></div>
        <div className="mt-5 max-h-56 space-y-3 overflow-y-auto">{cart.map((line) => <div key={line.product.id} className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm"><span className="text-slate-700">{line.product.name} × {line.quantity}</span><strong className="whitespace-nowrap text-slate-900">₹{(line.product.price * line.quantity).toFixed(2)}</strong></div>)}</div>
        <div className="mt-4 flex justify-between text-lg font-bold text-slate-900"><span>Estimated total</span><span>₹{total.toFixed(2)}</span></div>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Checkout details are only held in this page preview. OTP, live stock, payment and order placement need the backend before customer orders can be submitted.</div>
        <button disabled className="mt-4 w-full cursor-not-allowed rounded-xl bg-slate-300 px-4 py-3 font-semibold text-slate-600">Order placement unavailable in preview</button>
        <button onClick={() => { setShowCheckout(false); setShowCart(true); }} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to basket</button>
      </section>
    </div>}
  </div>;
};
