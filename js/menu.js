/* Trecia's Grill Part 3 enhancements: navigation, dynamic services, gallery search/sort/lightbox,
   live order estimate, client-side validation, AJAX form submissions and interactive Leaflet map. */
(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // Responsive mobile navigation.
  const menuButton = $('.menu-toggle');
  const navLinks = $('.nav-links');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('showing');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
    $$('a', navLinks).forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('showing'); menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  // Accessible accordions on pages containing details/FAQ disclosures.
  $$('[data-accordion-trigger]').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    button.setAttribute('aria-expanded', 'false'); panel.hidden = true;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded)); panel.hidden = expanded;
    });
  });

  // Load service cards dynamically from JSON, with a friendly fallback on file:// or network failure.
  const serviceCatalog = $('#service-catalog');
  if (serviceCatalog) {
    const renderServices = items => {
      serviceCatalog.replaceChildren();
      items.forEach(item => {
        const article = document.createElement('article'); article.className = 'card service-card';
        const heading = document.createElement('h2'); heading.textContent = item.name;
        const category = document.createElement('p'); category.className = 'eyebrow'; category.textContent = item.category;
        const description = document.createElement('p'); description.textContent = item.description;
        article.append(category, heading, description); serviceCatalog.append(article);
      });
    };
    fetch('data/services.json')
      .then(response => { if (!response.ok) throw new Error('Service data unavailable'); return response.json(); })
      .then(renderServices)
      .catch(() => renderServices([
        {name:'Dine-In',description:'Enjoy freshly prepared meals in a relaxed setting.',category:'Dining'},
        {name:'Takeaway',description:'Order selected meals to enjoy at home or work.',category:'Meals'},
        {name:'Wedding Catering',description:'Tailored menus for wedding celebrations.',category:'Catering'},
        {name:'Corporate Catering',description:'Food for meetings, launches and conferences.',category:'Catering'},
        {name:'Private Functions',description:'Packages for birthdays and family celebrations.',category:'Events'},
        {name:'Special Menus',description:'Ask about vegetarian, vegan, gluten-free and halal options.',category:'Dietary'}
      ]));
  }

  // Gallery live search and sorting.
  const search = $('#dish-search'); const gallery = $('#dish-gallery'); const sort = $('#dish-sort');
  const searchStatus = $('#dish-search-status');
  if (search && gallery) {
    const figures = $$('figure', gallery);
    const originalOrder = new Map(figures.map((figure, index) => [figure, index]));
    const applyGallery = () => {
      const term = search.value.trim().toLocaleLowerCase();
      const mode = sort ? sort.value : 'default';
      const ordered = [...figures].sort((a,b) => {
        const an = (a.querySelector('figcaption')?.textContent || a.querySelector('img')?.alt || '').trim();
        const bn = (b.querySelector('figcaption')?.textContent || b.querySelector('img')?.alt || '').trim();
        if (mode === 'az') return an.localeCompare(bn);
        if (mode === 'za') return bn.localeCompare(an);
        return originalOrder.get(a) - originalOrder.get(b);
      });
      ordered.forEach(figure => gallery.appendChild(figure));
      let visible = 0;
      figures.forEach(figure => {
        const text = `${figure.textContent} ${figure.querySelector('img')?.alt || ''}`.toLocaleLowerCase();
        const matches = text.includes(term); figure.hidden = !matches; if (matches) visible++;
      });
      if (searchStatus) searchStatus.textContent = visible ? `${visible} dish${visible === 1 ? '' : 'es'} found.` : 'No dishes match that search. Try another name.';
    };
    search.addEventListener('input', applyGallery); if (sort) sort.addEventListener('change', applyGallery);
  }

  // Accessible lightbox with focus restoration, Escape and backdrop close.
  const dishImages = $$('img[src*="images/dish-"]');
  if (dishImages.length) {
    const lightbox = document.createElement('div'); lightbox.className = 'image-lightbox';
    lightbox.setAttribute('role','dialog'); lightbox.setAttribute('aria-modal','true');
    lightbox.setAttribute('aria-label','Dish image enlarged view'); lightbox.hidden = true;
    lightbox.innerHTML = '<div class="lightbox-content"><button type="button" class="lightbox-close" aria-label="Close enlarged image">×</button><img class="lightbox-image" alt=""><p class="lightbox-caption"></p><p class="lightbox-help">Press Escape or select Close to return to the page.</p></div>';
    document.body.appendChild(lightbox); const enlarged = $('.lightbox-image',lightbox);
    const caption = $('.lightbox-caption',lightbox); const close = $('.lightbox-close',lightbox); let previousFocus = null;
    const openImage = img => { previousFocus=img; enlarged.src=img.currentSrc||img.src; enlarged.alt=img.alt||'Enlarged dish photograph';
      caption.textContent=img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt || "Trecia's Grill dish";
      lightbox.hidden=false; document.body.classList.add('lightbox-open'); close.focus(); };
    const closeImage = () => { lightbox.hidden=true; document.body.classList.remove('lightbox-open'); enlarged.removeAttribute('src'); if(previousFocus) previousFocus.focus(); };
    dishImages.forEach(img => { img.classList.add('zoomable-dish'); img.tabIndex=0; img.setAttribute('role','button');
      img.setAttribute('aria-label',`View larger image: ${img.alt||'dish'}`); img.addEventListener('click',()=>openImage(img));
      img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openImage(img);}}); });
    close.addEventListener('click',closeImage); lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeImage();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)closeImage();});
  }

  // Live estimate calculator.
  const quantitySelects = $$('.quantity-select[data-price]');
  const totalOutput = $('#estimate-total'); const quantityOutput = $('#estimate-quantity'); const estimateStatus = $('#estimate-status');
  const money = amount => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(amount);
  function calculateEstimate() {
    let total=0, portions=0; const lines=[];
    quantitySelects.forEach(select=>{const quantity=Number.parseInt(select.value,10)||0; const price=Number.parseFloat(select.dataset.price)||0;
      const name=select.closest('.food-item')?.querySelector('h3')?.textContent.trim()||select.name;
      if(quantity>0){total+=quantity*price;portions+=quantity;lines.push(`${name}: ${quantity} x ${money(price)} = ${money(quantity*price)}`);}});
    if(totalOutput)totalOutput.textContent=money(total); if(quantityOutput)quantityOutput.textContent=String(portions);
    if(estimateStatus)estimateStatus.textContent=portions?`Estimate updated for ${portions} portion${portions===1?'':'s'}.`:'Select menu quantities to calculate your estimate.';
    return {total,portions,lines};
  }
  quantitySelects.forEach(select=>select.addEventListener('change',calculateEstimate)); if(quantitySelects.length)calculateEstimate();

  // Custom inline validation messages plus HTML5 constraints.
  function validateForm(form) {
    form.querySelectorAll('[data-error-for]').forEach(el=>el.remove());
    let valid = form.checkValidity();
    form.querySelectorAll('input,select,textarea').forEach(field=>{
      if(field.type==='hidden'||field.name==='_honey')return;
      field.setAttribute('aria-invalid', field.validity.valid ? 'false':'true');
      if(!field.validity.valid){const error=document.createElement('small'); error.className='field-error'; error.dataset.errorFor=field.id||field.name;
        error.textContent=field.validationMessage||'Please check this field.'; field.insertAdjacentElement('afterend',error);}
    });
    if(!valid){const first=form.querySelector(':invalid'); if(first)first.focus(); form.reportValidity();}
    return valid;
  }
  async function submitAjax(form, statusElement, extraFields={}) {
    if(!validateForm(form)) return;
    const submitButton=form.querySelector('[type="submit"]'); const original=submitButton?.textContent;
    if(submitButton){submitButton.disabled=true;submitButton.textContent='Sending…';}
    if(statusElement)statusElement.textContent='Sending your message securely. Please wait…';
    const data=Object.fromEntries(new FormData(form).entries());
    Object.assign(data,extraFields);
    // Honeypot is intentionally submitted for spam filtering, but never display its value.
    try {
      const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
      let result={}; try{result=await response.json();}catch(_e){}
      if(!response.ok || result.success===false) throw new Error(result.message||'The form service could not accept the submission.');
      if(statusElement)statusElement.textContent='Thank you. Your submission was sent to the form service. If this is the first submission, the recipient may need to activate the email address with the form provider.';
      form.reset(); calculateEstimate();
    } catch(error) {
      if(statusElement)statusElement.textContent='We could not submit the form automatically. Please check your internet connection or contact us directly at '+(form.id==='enquiry-form'?'bookings@trecias.co.za':'info@trecias.co.za')+'. Details: '+error.message;
    } finally { if(submitButton){submitButton.disabled=false;submitButton.textContent=original||'Submit';} }
  }
  const enquiryForm=$('#enquiry-form');
  if(enquiryForm) {
    const serviceField=$('#service', enquiryForm); const dateField=$('#date', enquiryForm); const timeField=$('#time', enquiryForm);
    const guestsField=$('#guests', enquiryForm);
    const today=new Date(); const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
    if(dateField) dateField.min=localToday;
    const updateBookingRequirements=()=>{
      const selected=(serviceField?.value||'').toLowerCase();
      const isBooking=selected.includes('book') || selected.includes('tasting');
      if(dateField)dateField.required=isBooking;
      if(timeField)timeField.required=isBooking;
      if(guestsField)guestsField.required=selected.includes('tasting') || selected.includes('order');
    };
    serviceField?.addEventListener('change',updateBookingRequirements); updateBookingRequirements();
    enquiryForm.addEventListener('submit',event=>{
    event.preventDefault(); const estimate=calculateEstimate();
    const summary=estimate.lines.length?estimate.lines.join('\n'):'No menu items selected';
    submitAjax(enquiryForm,$('#enquiry-status'),{order_items:summary,estimated_portions:String(estimate.portions),estimated_total:money(estimate.total),price_disclaimer:'Estimate only; final availability and prices must be confirmed.'});
    });
  }
  const contactForm=$('#contact-form');
  if(contactForm)contactForm.addEventListener('submit',event=>{event.preventDefault();submitAjax(contactForm,$('#contact-status'));});

  // Leaflet map: broad service-area city centres only; not a claimed street address.
  const mapElement=$('#service-area-map');
  if(mapElement && window.L){
    const map=L.map(mapElement,{scrollWheelZoom:false}).setView([-26.0,28.0],6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    L.marker([-25.7479,28.2293]).addTo(map).bindPopup('<strong>Pretoria service area</strong><br>Approximate city centre; confirm the restaurant address before visiting.');
    L.marker([-26.2041,28.0473]).addTo(map).bindPopup('<strong>Johannesburg service area</strong><br>Approximate city centre; service area only.');
  }
})();
