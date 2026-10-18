// Konfigurasi Tailwind untuk build CSS statis (menggantikan Tailwind CDN yang dikompilasi di browser tiap kunjungan).
// Jalankan `npm run build:css` setiap kali menambah/mengubah class Tailwind di frontend/*.html atau frontend/js/**/*.js.
module.exports={content:['./frontend/**/*.{html,js}'],theme:{extend:{colors:{ink:'#02040a',cy:{DEFAULT:'#2de2e6',dim:'#0e9fb0'},vi:{DEFAULT:'#b66dff',dim:'#7e22ce'}},fontFamily:{display:['Sora','sans-serif'],sans:['Manrope','system-ui','sans-serif']}}}};
