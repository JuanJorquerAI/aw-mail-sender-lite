document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos del DOM
  const navLinks = document.querySelectorAll('.list-group-item');
  const sections = document.querySelectorAll('[id^="section-"]');
  const successToast = new bootstrap.Toast(document.getElementById('successToast'));
  const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
  
  // Navegación
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Actualizar navegación
      navLinks.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      
      // Mostrar sección correspondiente
      const targetId = this.id.replace('nav-', 'section-');
      sections.forEach(section => {
        section.classList.add('d-none');
        if (section.id === targetId) {
          section.classList.remove('d-none');
        }
      });
      
      // Cargar datos específicos de la sección
      if (targetId === 'section-lists') {
        loadLists();
      } else if (targetId === 'section-campaign') {
        loadListsForCampaign();
        loadProviders('campaignProvider');
      } else if (targetId === 'section-test') {
        loadProviders('testProvider');
      }
    });
  });
  
  // Cargar listas de contactos
  function loadLists() {
    fetch('/api/lists')
      .then(response => response.json())
      .then(data => {
        const listsContainer = document.getElementById('lists-container');
        
        if (data.success && data.lists.length > 0) {
          let html = '<div class="list-group">';
          data.lists.forEach(list => {
            html += `
              <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">${list.name}</h6>
                  <small>${new Date(list.createdAt).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">ID: ${list._id}</p>
              </div>
            `;
          });
          html += '</div>';
          listsContainer.innerHTML = html;
        } else {
          listsContainer.innerHTML = '<div class="alert alert-info">No hay listas disponibles. Importa contactos para crear una lista.</div>';
        }
      })
      .catch(error => {
        console.error('Error al cargar listas:', error);
        listsContainer.innerHTML = '<div class="alert alert-danger">Error al cargar las listas.</div>';
      });
  }
  
  // Cargar listas para el formulario de campaña
  function loadListsForCampaign() {
    fetch('/api/lists')
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById('campaignList');
        select.innerHTML = '<option value="">Selecciona una lista...</option>';
        
        if (data.success && data.lists.length > 0) {
          data.lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list._id;
            option.textContent = list.name;
            select.appendChild(option);
          });
        } else {
          const option = document.createElement('option');
          option.disabled = true;
          option.textContent = 'No hay listas disponibles';
          select.appendChild(option);
        }
      })
      .catch(error => {
        console.error('Error al cargar listas para campaña:', error);
      });
  }
  
  // Cargar proveedores de email
  function loadProviders(selectId) {
    fetch('/api/providers')
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById(selectId);
        select.innerHTML = '';
        
        if (data.success && data.providers.length > 0) {
          data.providers.forEach(provider => {
            if (provider.available) {
              const option = document.createElement('option');
              option.value = provider.id;
              option.textContent = provider.name;
              select.appendChild(option);
            }
          });
        } else {
          const option = document.createElement('option');
          option.value = 'aws-ses';
          option.textContent = 'Amazon SES';
          select.appendChild(option);
        }
      })
      .catch(error => {
        console.error('Error al cargar proveedores:', error);
      });
  }
  
  // Formulario de importación de CSV
  const importForm = document.getElementById('import-form');
  if (importForm) {
    importForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const importBtn = document.getElementById('import-btn');
      const importSpinner = document.getElementById('import-spinner');
      
      // Mostrar spinner
      importBtn.disabled = true;
      importSpinner.classList.remove('d-none');
      
      fetch('/api/import-csv', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Ocultar spinner
        importBtn.disabled = false;
        importSpinner.classList.add('d-none');
        
        if (data.success) {
          showSuccess(data.message);
          importForm.reset();
          loadLists();
        } else {
          showError(data.message || 'Error al importar contactos');
        }
      })
      .catch(error => {
        console.error('Error al importar CSV:', error);
        importBtn.disabled = false;
        importSpinner.classList.add('d-none');
        showError('Error al importar contactos');
      });
    });
  }
  
  // Formulario de envío de campaña
  const campaignForm = document.getElementById('campaign-form');
  if (campaignForm) {
    campaignForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const campaignBtn = document.getElementById('campaign-btn');
      const campaignSpinner = document.getElementById('campaign-spinner');
      
      // Mostrar spinner
      campaignBtn.disabled = true;
      campaignSpinner.classList.remove('d-none');
      
      // Convertir FormData a objeto
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      fetch('/api/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        // Ocultar spinner
        campaignBtn.disabled = false;
        campaignSpinner.classList.add('d-none');
        
        if (data.success) {
          showSuccess(`${data.message} ID de campaña: ${data.campaignId}`);
        } else {
          showError(data.message || 'Error al enviar campaña');
        }
      })
      .catch(error => {
        console.error('Error al enviar campaña:', error);
        campaignBtn.disabled = false;
        campaignSpinner.classList.add('d-none');
        showError('Error al enviar campaña');
      });
    });
  }
  
  // Formulario de envío de prueba
  const testForm = document.getElementById('test-form');
  if (testForm) {
    testForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const testBtn = document.getElementById('test-btn');
      const testSpinner = document.getElementById('test-spinner');
      
      // Mostrar spinner
      testBtn.disabled = true;
      testSpinner.classList.remove('d-none');
      
      // Convertir FormData a objeto
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      fetch('/api/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        // Ocultar spinner
        testBtn.disabled = false;
        testSpinner.classList.add('d-none');
        
        if (data.success) {
          showSuccess(data.message);
        } else {
          showError(data.message || 'Error al enviar correo de prueba');
        }
      })
      .catch(error => {
        console.error('Error al enviar correo de prueba:', error);
        testBtn.disabled = false;
        testSpinner.classList.add('d-none');
        showError('Error al enviar correo de prueba');
      });
    });
  }
  
  // Botón de estadísticas
  const statsBtn = document.getElementById('stats-btn');
  if (statsBtn) {
    statsBtn.addEventListener('click', function() {
      const campaignId = document.getElementById('statsCampaign').value.trim();
      
      if (!campaignId) {
        showError('Ingresa un ID de campaña válido');
        return;
      }
      
      const statsSpinner = document.getElementById('stats-spinner');
      
      // Mostrar spinner
      statsBtn.disabled = true;
      statsSpinner.classList.remove('d-none');
      
      fetch(`/api/stats/${campaignId}`)
        .then(response => response.json())
        .then(data => {
          // Ocultar spinner
          statsBtn.disabled = false;
          statsSpinner.classList.add('d-none');
          
          if (data.success) {
            document.getElementById('stats-container').classList.remove('d-none');
            document.getElementById('stats-total-opens').textContent = data.stats.totalOpens;
            document.getElementById('stats-unique-opens').textContent = data.stats.uniqueOpens;
          } else {
            showError(data.message || 'Error al obtener estadísticas');
          }
        })
        .catch(error => {
          console.error('Error al obtener estadísticas:', error);
          statsBtn.disabled = false;
          statsSpinner.classList.add('d-none');
          showError('Error al obtener estadísticas');
        });
    });
  }
  
  // Formulario de configuración
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    // Cargar configuración actual
    fetch('/api/settings')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Object.keys(data.settings).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
              input.value = data.settings[key] || '';
            }
          });
        }
      })
      .catch(error => {
        console.error('Error al cargar configuración:', error);
      });
    
    // Guardar configuración
    settingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const settingsBtn = document.getElementById('settings-btn');
      const settingsSpinner = document.getElementById('settings-spinner');
      
      // Mostrar spinner
      settingsBtn.disabled = true;
      settingsSpinner.classList.remove('d-none');
      
      // Convertir FormData a objeto
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        // Ocultar spinner
        settingsBtn.disabled = false;
        settingsSpinner.classList.add('d-none');
        
        if (data.success) {
          showSuccess('Configuración guardada correctamente');
        } else {
          showError(data.message || 'Error al guardar configuración');
        }
      })
      .catch(error => {
        console.error('Error al guardar configuración:', error);
        settingsBtn.disabled = false;
        settingsSpinner.classList.add('d-none');
        showError('Error al guardar configuración');
      });
    });
  }
  
  // Funciones de utilidad para mostrar mensajes
  function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    successToast.show();
  }
  
  function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorToast.show();
  }
  
  // Cargar listas al inicio
  loadLists();
});