// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getLaptopSpecs") {
    const specs = extractLaptopSpecs();
    sendResponse({specs: specs});
  }
  return true;
});

function extractLaptopSpecs() {
  const specs = {
    // General
    model: null,
    brand: null,
    laptopSeries: null,
    partNo: null,
    // Processor
    processorModel: null,
    generation: null,
    processorMaxTurboFrequency: null,
    processorCore: null,
    // Memory
    ram: null,
    ramBus: null,
    ramType: null,
    maxRamSupport: null,
    // Storage
    storage: null,
    storageUpgrade: null,
    // Graphics
    graphicsChipset: null,
    graphicsMemory: null,
    // Display
    displaySize: null,
    displayType: null,
    panelType: null,
    displayResolution: null,
    displayRefreshRate: null,
    // Warranty
    warrantyDetails: null
  };

  try {
    const specRows = document.querySelectorAll('.row.table-hr-remove');

    specRows.forEach(row => {
      const titleElement = row.querySelector('.att-title');
      const valueElement = row.querySelector('.att-value');

      if (titleElement && valueElement) {
        const title = titleElement.textContent.trim();
        const value = valueElement.textContent.trim();

        // General
        if (title === 'Model') specs.model = value;
        else if (title === 'Brand') specs.brand = value;
        else if (title === 'Laptop Series') specs.laptopSeries = value;
        else if (title === 'Part No') specs.partNo = value;

        // Processor
        else if (title === 'Processor Brand') specs.processorBrand = value;
        else if (title === 'Processor Type.') specs.processorType = value;
        else if (title === 'Generation') specs.generation = value;
        else if (title === 'Processor Model') specs.processorModel = value;
        else if (title === 'Processor Base Frequency') specs.processorBaseFreq = value;
        else if (title === 'Performance-Core Base Frequency') specs.perfCoreBaseFreq = value;
        else if (title === 'Efficient-Core Base Frequency') specs.effCoreBaseFreq = value;
        else if (title === 'Processor Max Turbo Frequency') specs.processorMaxTurboFrequency = value;
        else if (title === 'Processor Core') specs.processorCore = value;

        // Memory
        else if (title === 'RAM') specs.ram = value;
        else if (title === 'RAM Bus') specs.ramBus = value;
        else if (title === 'RAM Type') specs.ramType = value;
        else if (title === 'Max. RAM Support') specs.maxRamSupport = value;

        // Storage
        else if (title === 'Storage') specs.storage = value;
        else if (title === 'Storage Upgrade') specs.storageUpgrade = value;

        // Graphics
        else if (title === 'Graphics Chipset') specs.graphicsChipset = value;
        else if (title === 'Graphics Memory') specs.graphicsMemory = value;

        // Display
        else if (title === 'Display Size (Inch)') specs.displaySize = value;
        else if (title === 'Display Type') specs.displayType = value;
        else if (title === 'Panel Type') specs.panelType = value;
        else if (title === 'Display Resolution') specs.displayResolution = value;
        else if (title === 'Refresh Rate') specs.displayRefreshRate = value;

        // Warranty
        else if (title === 'Warranty Details') specs.warrantyDetails = value;
      }
    });
  } catch (error) {
    console.error('Error extracting laptop specs:', error);
  }

  return specs;
}

// Also extract specs when page loads to be ready for popup
(function init() {
  // Check if we're on a page with laptop specifications
  const specRows = document.querySelectorAll('.row.table-hr-remove');
  if (specRows.length > 0) {
    console.log('Laptop Spec Extractor: Page contains specification data');
  }
})();