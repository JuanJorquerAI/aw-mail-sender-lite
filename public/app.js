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
                <button class="btn btn-sm btn-primary mt-2 view-subscribers" data-list-id="${list._id}" data-list-name="${list.name}">
                  <i class="bi bi-people"></i> Ver Contactos
                </button>
              </div>
            `;
          });
          html += '</div>';
          listsContainer.innerHTML = html;
          
          // Añadir event listeners a los botones de ver contactos
          document.querySelectorAll('.view-subscribers').forEach(button => {
            button.addEventListener('click', function() {
              const listId = this.getAttribute('data-list-id');
              const listName = this.getAttribute('data-list-name');
              loadSubscribers(listId, listName);
            });
          });
        } else {
          listsContainer.innerHTML = '<div class="alert alert-info">No hay listas disponibles. Importa contactos para crear una lista.</div>';
        }
      })
      .catch(error => {
        console.error('Error al cargar listas:', error);
        listsContainer.innerHTML = '<div class="alert alert-danger">Error al cargar las listas.</div>';
      });
  }
  
  // Cargar suscriptores de una lista
  function loadSubscribers(listId, listName) {
    document.getElementById('lists-container').classList.add('d-none');
    const subscribersContainer = document.getElementById('subscribers-container');
    subscribersContainer.classList.remove('d-none');
    document.getElementById('current-list-name').textContent = listName;
    document.getElementById('subscriber-list-id').value = listId;
    
    fetch(`/api/lists/${listId}/subscribers`)
      .then(response => response.json())
      .then(data => {
        const subscribersList = document.getElementById('subscribers-list');
        
        if (data.success && data.subscribers.length > 0) {
          let html = '';
          data.subscribers.forEach(subscriber => {
            html += `
              <tr>
                <td>${subscriber.email}</td>
                <td>${subscriber.name || '-'}</td>
                <td>${subscriber.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary edit-subscriber" data-id="${subscriber._id}">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-subscriber" data-id="${subscriber._id}">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            `;
          });
          subscribersList.innerHTML = html;
          
          // Añadir event listeners a los botones de editar y eliminar
          setupSubscriberActions();
        } else {
          subscribersList.innerHTML = `<tr><td colspan="4" class="text-center">No hay contactos en esta lista</td></tr>`;
        }
      })
      .catch(error => {
        console.error('Error al cargar suscriptores:', error);
        document.getElementById('subscribers-list').innerHTML = 
          `<tr><td colspan="4" class="text-center text-danger">Error al cargar los contactos</td></tr>`;
      });
  }
  
  // Configurar acciones para los botones de suscriptores
  function setupSubscriberActions() {
    // Botón para volver a la lista de listas
    document.getElementById('btn-back-to-lists').addEventListener('click', function() {
      document.getElementById('subscribers-container').classList.add('d-none');
      document.getElementById('lists-container').classList.remove('d-none');
    });
    
    // Botón para añadir nuevo suscriptor
    document.getElementById('btn-add-subscriber').addEventListener('click', function() {
      // Limpiar formulario
      document.getElementById('subscriber-form').reset();
      document.getElementById('subscriber-id').value = '';
      document.getElementById('custom-fields-container').innerHTML = '';
      
      // Cambiar título del modal
      document.getElementById('subscriberModalLabel').textContent = 'Añadir Contacto';
      
      // Mostrar modal
      const subscriberModal = new bootstrap.Modal(document.getElementById('subscriberModal'));
      subscriberModal.show();
    });
    
    // Botones para editar suscriptor
    document.querySelectorAll('.edit-subscriber').forEach(button => {
      button.addEventListener('click', function() {
        const subscriberId = this.getAttribute('data-id');
        
        // Obtener datos del suscriptor
        fetch(`/api/subscribers/${subscriberId}`)
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              const subscriber = data.subscriber;
              
              // Llenar formulario
              document.getElementById('subscriber-id').value = subscriber._id;
              document.getElementById('subscriber-email').value = subscriber.email;
              document.getElementById('subscriber-name').value = subscriber.name || '';
              
              // Llenar campos personalizados
              const customFieldsContainer = document.getElementById('custom-fields-container');
              customFieldsContainer.innerHTML = '';
              
              if (subscriber.customFields && typeof subscriber.customFields === 'object') {
                Object.entries(subscriber.customFields).forEach(([key, value]) => {
                  addCustomFieldToForm(key, value);
                });
              }
              
              // Cambiar título del modal
              document.getElementById('subscriberModalLabel').textContent = 'Editar Contacto';
              
              // Mostrar modal
              const subscriberModal = new bootstrap.Modal(document.getElementById('subscriberModal'));
              subscriberModal.show();
            } else {
              showError('Error al cargar los datos del contacto');
            }
          })
          .catch(error => {
            console.error('Error al obtener suscriptor:', error);
            showError('Error al cargar los datos del contacto');
          });
      });
    });
    
    // Botones para eliminar suscriptor
    document.querySelectorAll('.delete-subscriber').forEach(button => {
      button.addEventListener('click', function() {
        const subscriberId = this.getAttribute('data-id');
        document.getElementById('btn-confirm-delete').setAttribute('data-id', subscriberId);
        
        // Mostrar modal de confirmación
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();
      });
    });
    
    // Botón para confirmar eliminación
    document.getElementById('btn-confirm-delete').addEventListener('click', function() {
      const subscriberId = this.getAttribute('data-id');
      const listId = document.getElementById('subscriber-list-id').value;
      
      fetch(`/api/subscribers/${subscriberId}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            
            // Recargar lista de suscriptores
            const listName = document.getElementById('current-list-name').textContent;
            loadSubscribers(listId, listName);
            
            showSuccess('Contacto eliminado correctamente');
          } else {
            showError(data.message || 'Error al eliminar el contacto');
          }
        })
        .catch(error => {
          console.error('Error al eliminar suscriptor:', error);
          showError('Error al eliminar el contacto');
        });
    });
    
    // Botón para guardar suscriptor
    document.getElementById('btn-save-subscriber').addEventListener('click', function() {
      const subscriberId = document.getElementById('subscriber-id').value;
      const listId = document.getElementById('subscriber-list-id').value;
      const email = document.getElementById('subscriber-email').value;
      const name = document.getElementById('subscriber-name').value;
      
      // Recopilar campos personalizados
      const customFields = {};
      document.querySelectorAll('#custom-fields-container .custom-field-row').forEach(row => {
        const key = row.querySelector('.custom-field-key').value;
        const value = row.querySelector('.custom-field-value').value;
        if (key && value) {
          customFields[key] = value;
        }
      });
      
      // Validar email
      if (!email) {
        showError('El email es obligatorio');
        return;
      }
      
      if (subscriberId) {
        // Actualizar suscriptor existente
        fetch(`/api/subscribers/${subscriberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            name,
            customFields
          })
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Cerrar modal
              bootstrap.Modal.getInstance(document.getElementById('subscriberModal')).hide();
              
              // Recargar lista de suscriptores
              const listName = document.getElementById('current-list-name').textContent;
              loadSubscribers(listId, listName);
              
              showSuccess('Contacto actualizado correctamente');
            } else {
              showError(data.message || 'Error al actualizar el contacto');
            }
          })
          .catch(error => {
            console.error('Error al actualizar suscriptor:', error);
            showError('Error al actualizar el contacto');
          });
      } else {
        // Crear nuevo suscriptor
        fetch(`/api/lists/${listId}/subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            name,
            customFields
          })
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Cerrar modal
              bootstrap.Modal.getInstance(document.getElementById('subscriberModal')).hide();
              
              // Recargar lista de suscriptores
              const listName = document.getElementById('current-list-name').textContent;
              loadSubscribers(listId, listName);
              
              showSuccess('Contacto añadido correctamente');
            } else {
              showError(data.message || 'Error al añadir el contacto');
            }
          })
          .catch(error => {
            console.error('Error al crear suscriptor:', error);
            showError('Error al añadir el contacto');
          });
      }
    });
    
    // Botón para añadir campo personalizado
    document.getElementById('btn-add-custom-field').addEventListener('click', function() {
      addCustomFieldToForm();
    });
  }
  
  // Añadir campo personalizado al formulario
  function addCustomFieldToForm(key = '', value = '') {
    const container = document.getElementById('custom-fields-container');
    const fieldId = Date.now();
    
    const fieldRow = document.createElement('div');
    fieldRow.className = 'row mb-2 custom-field-row';
    fieldRow.innerHTML = `
      <div class="col-5">
        <input type="text" class="form-control custom-field-key" placeholder="Campo" value="${key}">
      </div>
      <div class="col-5">
        <input type="text" class="form-control custom-field-value" placeholder="Valor" value="${value}">
      </div>
      <div class="col-2">
        <button type="button" class="btn btn-sm btn-outline-danger remove-field">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;
    
    container.appendChild(fieldRow);
    
    // Añadir event listener para eliminar campo
    fieldRow.querySelector('.remove-field').addEventListener('click', function() {
      container.removeChild(fieldRow);
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
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-success alert-dismissible fade show';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.getElementById('alerts-container').appendChild(alertElement);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      alertElement.classList.remove('show');
      setTimeout(() => alertElement.remove(), 150);
    }, 5000);
  }
  
  function showError(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.getElementById('alerts-container').appendChild(alertElement);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      alertElement.classList.remove('show');
      setTimeout(() => alertElement.remove(), 150);
    }, 5000);
  }
  
  // Cargar listas al inicio
  loadLists();
});