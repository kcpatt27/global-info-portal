/**
 * infoTextCycling.js - Module for cycling through info text sections
 */

import { processText } from './utils/dataFetcher.js';

// Main function to set up background info cycling
export function setupBackgroundInfoCycling(data) {
  // Get the background info container
  const backgroundInfo = document.querySelector('.background-info');
  if (!backgroundInfo) return;
  
  // Extract all text sections from the data
  const textSections = extractTextSections(data);
  if (!textSections.length) {
    backgroundInfo.innerHTML = '<div class="centered-text">No background information available</div>';
    return;
  }
  
  // Set up the cycling UI
  let currentIndex = 0;
  
  backgroundInfo.innerHTML = `
    <div class="info-cycling-container">
      <div class="info-cycling-header">
        <button class="cycle-button prev" aria-label="Previous section"><i class="fas fa-chevron-left"></i></button>
        <div class="cycle-indicator-top"><span class="current-index">${currentIndex + 1}</span>/<span class="total-count">${textSections.length}</span></div>
        <button class="cycle-button next" aria-label="Next section"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="navigation-content-wrapper">
        <div class="info-text-container">
          <div class="info-text-content">${textSections[currentIndex].content}</div>
          <div class="info-text-source">${textSections[currentIndex].title}</div>
        </div>
      </div>
    </div>
    <div class="cycle-indicator">
      <span class="current-index">${currentIndex + 1}</span>/<span class="total-count">${textSections.length}</span>
    </div>
  `;
  
  // Add event listeners for navigation
  const prevButton = backgroundInfo.querySelector('.cycle-button.prev');
  const nextButton = backgroundInfo.querySelector('.cycle-button.next');
  const textContent = backgroundInfo.querySelector('.info-text-content');
  const textSource = backgroundInfo.querySelector('.info-text-source');
  const currentIndexEl = backgroundInfo.querySelectorAll('.current-index');
  
  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + textSections.length) % textSections.length;
    updateContent();
  });
  
  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % textSections.length;
    updateContent();
  });
  
  function updateContent() {
    // Add transition class
    textContent.classList.add('text-transition-out');
    
    // After transition completes, update content and animate in
    setTimeout(() => {
      textContent.innerHTML = textSections[currentIndex].content;
      textSource.textContent = textSections[currentIndex].title;
      // Update both top and bottom indicators (if present)
      currentIndexEl.forEach(el => el.textContent = currentIndex + 1);
      
      // Scroll back to top when changing content
      textContent.scrollTop = 0;
      
      textContent.classList.remove('text-transition-out');
      textContent.classList.add('text-transition-in');
      
      setTimeout(() => {
        textContent.classList.remove('text-transition-in');
      }, 300);
    }, 300);
  }
}

// Helper function to extract text sections from various data categories
function extractTextSections(data) {
  const sections = [];
  
  // Add introduction if available
  if (data.Introduction && data.Introduction.Background) {
    sections.push({
      title: 'Introduction',
      content: processText(data.Introduction.Background.text)
    });
  }
  
  // Add geography text and details
  if (data.Geography) {
    // Add main geography text
    if (data.Geography.text) {
      sections.push({
        title: 'Geography Overview',
        content: processText(data.Geography.text)
      });
    }
    
    // Add climate information
    if (data.Geography.Climate && data.Geography.Climate.text) {
      sections.push({
        title: 'Climate',
        content: processText(data.Geography.Climate.text)
      });
    }
    
    // Add terrain information
    if (data.Geography.Terrain && data.Geography.Terrain.text) {
      sections.push({
        title: 'Terrain',
        content: processText(data.Geography.Terrain.text)
      });
    }
  }
  
  // Add economy overview
  if (data.Economy && data.Economy['Economic overview']) {
    sections.push({
      title: 'Economy Overview',
      content: processText(data.Economy['Economic overview'].text)
    });
  }
  
  // Add government information
  if (data.Government) {
    if (data.Government['Government type'] && data.Government['Government type'].text) {
      sections.push({
        title: 'Government',
        content: processText(data.Government['Government type'].text)
      });
    }
  }
  
  // Add people and society information
  if (data['People and Society']) {
    const peopleData = data['People and Society'];
    let peopleContent = '';
    
    // Combine relevant demographic information
    if (peopleData.Population && peopleData.Population.total) {
      peopleContent += `Population: ${peopleData.Population.total.text}\n\n`;
    }
    if (peopleData['Ethnic groups']) {
      peopleContent += `Ethnic Groups: ${peopleData['Ethnic groups'].text}\n\n`;
    }
    if (peopleData.Languages) {
      peopleContent += `Languages: ${peopleData.Languages.text}\n\n`;
    }
    if (peopleData.Religions) {
      peopleContent += `Religions: ${peopleData.Religions.text}`;
    }
    
    if (peopleContent) {
      sections.push({
        title: 'People and Society',
        content: processText(peopleContent)
      });
    }
  }
  
  // Add military information
  if (data['Military and Security']) {
    const militaryData = data['Military and Security'];
    let militaryContent = '';
    
    if (militaryData['Military and security forces']) {
      militaryContent += militaryData['Military and security forces'].text + '\n\n';
    }
    if (militaryData['Military - note']) {
      militaryContent += militaryData['Military - note'].text;
    }
    
    if (militaryContent) {
      sections.push({
        title: 'Military and Security',
        content: processText(militaryContent)
      });
    }
  }
  
  // Add transnational issues if available
  if (data['Transnational Issues']) {
    const issues = data['Transnational Issues'];
    let issuesContent = '';
    
    Object.entries(issues).forEach(([key, value]) => {
      if (value && value.text) {
        issuesContent += `${key}: ${value.text}\n\n`;
      }
    });
    
    if (issuesContent) {
      sections.push({
        title: 'Transnational Issues',
        content: processText(issuesContent)
      });
    }
  }
  
  return sections;
}
