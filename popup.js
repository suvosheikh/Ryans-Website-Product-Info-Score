document.addEventListener('DOMContentLoaded', function() {
  const refreshBtn = document.getElementById('refresh-btn');
  const toggleSpecsBtn = document.getElementById('toggle-specs');
  const specsContainer = document.getElementById('specs-container');
  const notification = document.getElementById('notification');

  // Load initial data
  loadSpecifications();

  // Refresh button event
  refreshBtn.addEventListener('click', function() {
    refreshBtn.querySelector('i').classList.add('rotating');
    loadSpecifications();
    
    // Show notification
    notification.textContent = 'Data refreshed successfully!';
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
      refreshBtn.querySelector('i').classList.remove('rotating');
    }, 2000);
  });

  // Toggle specs event
  toggleSpecsBtn.addEventListener('click', function() {
    specsContainer.parentElement.classList.toggle('collapsed');
    toggleSpecsBtn.textContent = specsContainer.parentElement.classList.contains('collapsed') ? 'Expand' : 'Collapse';
  });

  // Function to load specifications
  function loadSpecifications() {
    const container = document.getElementById('specs-container');
    const noData = document.getElementById('no-data');

    container.innerHTML = '<div class="loading"><div class="loading-dots"><div></div><div></div><div></div></div></div>';
    noData.style.display = 'none';

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getLaptopSpecs"}, function(response) {
        container.innerHTML = '';

        if (chrome.runtime.lastError) {
          noData.textContent = 'Error: Could not extract data from this page';
          noData.style.display = 'block';
          updateScoreDisplay(0);
          return;
        }

        if (response && response.specs) {
          const specs = response.specs;
          noData.style.display = 'none';

          // Calculate and display the score
          const score = calculateScore(specs);
          updateScoreDisplay(score);
          
          // Update product name and timestamp
          document.getElementById('product-name').textContent = specs.model || 'Unknown Product';
          document.getElementById('product-updated').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

          // Categories and their fields
          const categories = [
            {
              name: 'General', 
              icon: 'fas fa-laptop',
              items: [
                {label: 'Model', value: specs.model, icon: 'fas fa-tag'},
                {label: 'Brand', value: specs.brand, icon: 'fas fa-building'},
                {label: 'Laptop Series', value: specs.laptopSeries, icon: 'fas fa-laptop'},
                {label: 'Part No', value: specs.partNo, icon: 'fas fa-barcode'}
              ]
            },
            {
              name: 'Processor', 
              icon: 'fas fa-microchip',
              items: [
                {label: 'Processor Model', value: specs.processorModel, icon: 'fas fa-microchip'},
                {label: 'Generation', value: specs.generation, icon: 'fas fa-forward'},
                {label: 'Max Turbo Frequency', value: specs.processorMaxTurboFrequency, icon: 'fas fa-tachometer-alt'},
                {label: 'Processor Cores', value: specs.processorCore, icon: 'fas fa-microchip'}
              ]
            },
            {
              name: 'Memory', 
              icon: 'fas fa-memory',
              items: [
                {label: 'RAM', value: specs.ram, icon: 'fas fa-memory'},
                {label: 'RAM Bus', value: specs.ramBus, icon: 'fas fa-tachometer-alt'},
                {label: 'RAM Type', value: specs.ramType, icon: 'fas fa-memory'},
                {label: 'Max RAM Support', value: specs.maxRamSupport, icon: 'fas fa-expand-arrows-alt'}
              ]
            },
            {
              name: 'Storage', 
              icon: 'fas fa-hdd',
              items: [
                {label: 'Storage', value: specs.storage, icon: 'fas fa-hdd'},
                {label: 'Storage Upgrade', value: specs.storageUpgrade, icon: 'fas fa-plus-circle'}
              ]
            },
            {
              name: 'Graphics', 
              icon: 'fas fa-gamepad',
              items: [
                {label: 'Graphics Chipset', value: specs.graphicsChipset, icon: 'fas fa-gamepad'},
                {label: 'Graphics Memory', value: specs.graphicsMemory, icon: 'fas fa-memory'}
              ]
            },
            {
              name: 'Display', 
              icon: 'fas fa-desktop',
              items: [
                {label: 'Display Size', value: specs.displaySize, icon: 'fas fa-desktop'},
                {label: 'Display Type', value: specs.displayType, icon: 'fas fa-tv'},
                {label: 'Panel Type', value: specs.panelType, icon: 'fas fa-square'},
                {label: 'Display Resolution', value: specs.displayResolution, icon: 'fas fa-expand'},
                {label: 'Refresh Rate', value: specs.displayRefreshRate, icon: 'fas fa-sync'}
              ]
            },
            {
              name: 'Warranty', 
              icon: 'fas fa-shield-alt',
              items: [
                {label: 'Warranty Details', value: specs.warrantyDetails, icon: 'fas fa-shield-alt'}
              ]
            }
          ];

          let hasData = false;

          categories.forEach(category => {
            const itemsWithData = category.items.filter(item => item.value);
            if (itemsWithData.length > 0) {
              hasData = true;
              
              // Add category header
              const categoryEl = document.createElement('div');
              categoryEl.className = 'category';
              categoryEl.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
              container.appendChild(categoryEl);
              
              // Add items for this category
              itemsWithData.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'spec-item';
                itemEl.innerHTML = `
                  <span class="spec-name">
                    <i class="${item.icon}"></i>
                    ${item.label}
                  </span>
                  <span class="spec-value">${item.value}</span>
                `;
                container.appendChild(itemEl);
              });
            }
          });

          if (!hasData) {
            noData.textContent = 'No specification data found on this page';
            noData.style.display = 'block';
            updateScoreDisplay(0);
          }
        } else {
          noData.textContent = 'No specification data found on this page';
          noData.style.display = 'block';
          updateScoreDisplay(0);
        }
      });
    });
  }

  // Function to calculate score based on specifications
  function calculateScore(specs) {
    let score = 0;
    let totalPossible = 0;
    
    // Processor scoring (up to 30 points)
    if (specs.processorModel) {
        totalPossible += 30;
        // Basic scoring based on processor generation and cores
        if (specs.generation) {
            const gen = parseInt(specs.generation) || 0;
            score += Math.min(gen * 2, 10); // Up to 10 points for newer generation
        }
        if (specs.processorCore) {
            const cores = parseInt(specs.processorCore) || 1;
            score += Math.min(cores * 2, 10); // Up to 10 points for more cores
        }
        // Additional points for higher clock speeds
        if (specs.processorMaxTurboFrequency) {
            const freq = parseFloat(specs.processorMaxTurboFrequency) || 0;
            score += Math.min(freq / 0.5, 10); // Up to 10 points for higher frequency
        }
    }
    
    // RAM scoring (up to 20 points)
    if (specs.ram) {
        totalPossible += 20;
        const ramGB = parseInt(specs.ram) || 0;
        score += Math.min(ramGB * 2, 20); // Up to 20 points for more RAM
    }
    
    // Storage scoring (up to 15 points)
    if (specs.storage) {
        totalPossible += 15;
        // Simple scoring based on storage size
        if (specs.storage.includes('TB')) {
            score += 15; // Full points for TB storage
        } else if (specs.storage.includes('GB')) {
            const storageGB = parseInt(specs.storage) || 0;
            score += Math.min(storageGB / 100, 10); // Partial points for GB storage
        }
    }
    
    // Display scoring (up to 20 points)
    if (specs.displayResolution) {
        totalPossible += 20;
        // Score based on resolution
        if (specs.displayResolution.includes('4K')) score += 20;
        else if (specs.displayResolution.includes('QHD')) score += 15;
        else if (specs.displayResolution.includes('Full HD')) score += 10;
        else score += 5;
        
        // Additional points for high refresh rate
        if (specs.displayRefreshRate) {
            const refreshRate = parseInt(specs.displayRefreshRate) || 0;
            if (refreshRate >= 120) score += 5;
            else if (refreshRate >= 90) score += 3;
        }
    }
    
    // Graphics scoring (up to 15 points)
    if (specs.graphicsChipset) {
        totalPossible += 15;
        // Basic scoring for dedicated graphics
        if (specs.graphicsChipset.includes('RTX') || specs.graphicsChipset.includes('RX')) {
            score += 15;
        } else if (specs.graphicsChipset.includes('GTX')) {
            score += 12;
        } else if (specs.graphicsChipset.includes('GT')) {
            score += 8;
        } else {
            score += 5; // Integrated graphics
        }
    }
    
    // Avoid division by zero
    if (totalPossible === 0) return 0;
    
    // Calculate final percentage
    return Math.round((score / totalPossible) * 100);
  }

  // Function to update the score display
  function updateScoreDisplay(score) {
    const scoreValue = document.querySelector('.score-value');
    const circleProgress = document.querySelector('.circle-progress');
    
    // Update the score text
    scoreValue.textContent = `${score}%`;
    
    // Update the progress circle (360 degrees for 100%)
    const degrees = (score / 100) * 360;
    circleProgress.style.transform = `rotate(${degrees}deg)`;
    
    // Update color based on score
    if (score >= 80) {
        circleProgress.style.background = 'conic-gradient(#4caf50 0%, #2e7d32 100%)';
    } else if (score >= 60) {
        circleProgress.style.background = 'conic-gradient(#8bc34a 0%, #4caf50 100%)';
    } else if (score >= 40) {
        circleProgress.style.background = 'conic-gradient(#cddc39 0%, #8bc34a 100%)';
    } else if (score >= 20) {
        circleProgress.style.background = 'conic-gradient(#ffc107 0%, #cddc39 100%)';
    } else {
        circleProgress.style.background = 'conic-gradient(#ff9800 0%, #ffc107 100%)';
    }
  }
});