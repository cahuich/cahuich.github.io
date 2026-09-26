// ============================================
// TRACKING DE CLICS EN ENLACES DE AFILIADOS
// Voyage Lumière - GA4 Event Tracking
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Identificar todos los enlaces de afiliados
  const affiliateLinks = document.querySelectorAll('a[rel*="sponsored"], a[href*="dpbolvw.net"], a[href*="tqlkg.com"], a[href*="iatiseguros.com"], a[href*="omio.sjv.io"], a[href*="airalo.tpx.gr"], a[href*="tiqets.com"], a[href*="getyourguide.com"], a[href*="booking.com"]');
  
  affiliateLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      
      // 2. Extraer información del enlace
      const href = this.href;
      const linkText = this.textContent.trim().substring(0, 50);
      const pageTitle = document.title;
      const pagePath = window.location.pathname;
      
      // 3. Determinar el tipo de afiliado
      let affiliateType = 'Otro';
      let affiliateName = 'Desconocido';
      
      if (href.includes('dpbolvw.net') || href.includes('tqlkg.com') || href.includes('booking.com')) {
        affiliateType = 'Alojamiento';
        affiliateName = 'Booking.com';
      } else if (href.includes('iatiseguros.com')) {
        affiliateType = 'Seguro de Viaje';
        affiliateName = 'IATI Seguros';
      } else if (href.includes('omio.sjv.io')) {
        affiliateType = 'Transporte';
        affiliateName = 'Omio';
      } else if (href.includes('airalo.tpx.gr')) {
        affiliateType = 'eSIM / Internet';
        affiliateName = 'Airalo';
      } else if (href.includes('tiqets.com')) {
        affiliateType = 'Entradas / Tours';
        affiliateName = 'Tiqets';
      } else if (href.includes('getyourguide.com')) {
        affiliateType = 'Entradas / Tours';
        affiliateName = 'GetYourGuide';
      }
      
      // 4. Enviar evento a GA4
      if (typeof gtag !== 'undefined') {
        gtag('event', 'affiliate_click', {
          'affiliate_type': affiliateType,
          'affiliate_name': affiliateName,
          'link_text': linkText,
          'page_title': pageTitle,
          'page_path': pagePath,
          'link_url': href,
          'value': 1,
          'currency': 'USD'
        });
        
        console.log('✅ Affiliate click tracked:', affiliateName, 'on', pageTitle);
      }
      
    });
  });
  
  console.log('🎯 Affiliate tracking initialized. Monitoring', affiliateLinks.length, 'affiliate links.');
});