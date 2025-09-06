// Projects Gallery Management

class ProjectsManager {
    constructor() {
        this.currentFilter = 'all';
        this.projectsPerPage = 9;
        this.currentPage = 1;
        this.allProjects = [];
        this.filteredProjects = [];
        this.init();
    }

    init() {
        this.loadProjectData();
        this.setupFilterButtons();
        this.setupLoadMore();
        this.renderProjects();
        console.log('Projects Manager initialized');
    }

    loadProjectData() {
        // Sample project data - in production this would come from Firebase
        this.allProjects = [
            {
                id: 'commercial-office-pasco',
                category: 'commercial',
                title: 'Pacific Northwest Office Complex',
                location: 'Pasco, WA',
                description: '25,000 sq ft modern commercial building with energy-efficient systems',
                year: 2023,
                size: '25,000 sq ft',
                features: ['LEED Certified', 'Smart Building Tech', 'Energy Efficient'],
                image: '🏢',
                featured: true
            },
            {
                id: 'medical-center-kennewick',
                category: 'medical',
                title: 'Columbia Medical Center',
                location: 'Kennewick, WA',
                description: 'State-of-the-art healthcare facility with specialized equipment',
                year: 2024,
                size: '18,000 sq ft',
                features: ['Healthcare Compliant', 'Advanced HVAC', 'Patient Centered'],
                image: '🏥',
                featured: true
            },
            {
                id: 'church-richland',
                category: 'religious',
                title: 'Trinity Community Church',
                location: 'Richland, WA',
                description: 'Beautiful sanctuary with modern acoustics and lighting',
                year: 2023,
                size: '12,000 sq ft',
                features: ['Sacred Architecture', 'Acoustic Optimized', 'Multi-Purpose'],
                image: '⛪',
                featured: true
            },
            {
                id: 'winery-walla-walla',
                category: 'winery',
                title: 'Columbia Valley Winery',
                location: 'Walla Walla, WA',
                description: 'Award-winning winery with tasting room and production facility',
                year: 2024,
                size: '15,000 sq ft',
                features: ['Temperature Controlled', 'Tasting Room', 'Production Facility'],
                image: '🍷',
                featured: true
            },
            {
                id: 'industrial-spokane',
                category: 'industrial',
                title: 'Northwest Manufacturing Facility',
                location: 'Spokane, WA',
                description: 'Heavy-duty manufacturing facility with specialized equipment',
                year: 2023,
                size: '45,000 sq ft',
                features: ['Heavy Load Bearing', 'Industrial Grade', 'Safety Compliant'],
                image: '🏭',
                featured: false
            },
            {
                id: 'commercial-portland',
                category: 'commercial',
                title: 'Portland Business Center',
                location: 'Portland, OR',
                description: 'Multi-tenant commercial complex with retail and office space',
                year: 2022,
                size: '32,000 sq ft',
                features: ['Multi-Tenant', 'Retail Space', 'Modern Design'],
                image: '🏢',
                featured: false
            },
            {
                id: 'medical-boise',
                category: 'medical',
                title: 'Boise Family Health Clinic',
                location: 'Boise, ID',
                description: 'Family healthcare clinic with pediatric and adult care facilities',
                year: 2023,
                size: '8,500 sq ft',
                features: ['Family Focused', 'Pediatric Suite', 'Modern Equipment'],
                image: '🏥',
                featured: false
            },
            {
                id: 'religious-eugene',
                category: 'religious',
                title: 'Faith Community Center',
                location: 'Eugene, OR',
                description: 'Multi-purpose religious facility with worship and community spaces',
                year: 2022,
                size: '16,000 sq ft',
                features: ['Multi-Purpose', 'Community Kitchen', 'Event Space'],
                image: '⛪',
                featured: false
            },
            {
                id: 'industrial-coeur-dalene',
                category: 'industrial',
                title: 'Mountain West Warehouse',
                location: 'Coeur d\'Alene, ID',
                description: 'Distribution warehouse with advanced logistics systems',
                year: 2024,
                size: '60,000 sq ft',
                features: ['Distribution Hub', 'Logistics Systems', 'Loading Docks'],
                image: '🏭',
                featured: false
            }
        ];

        this.filteredProjects = [...this.allProjects];
    }

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });
    }

    handleFilterChange(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Filter projects
        this.currentFilter = filter;
        this.currentPage = 1;
        this.filterProjects();
        this.renderProjects();
    }

    filterProjects() {
        if (this.currentFilter === 'all') {
            this.filteredProjects = [...this.allProjects];
        } else {
            this.filteredProjects = this.allProjects.filter(project => 
                project.category === this.currentFilter
            );
        }

        // Update gallery state
        const gallery = document.getElementById('projectsGallery');
        if (this.filteredProjects.length === 0) {
            gallery.classList.add('empty');
            gallery.classList.remove('loading');
        } else {
            gallery.classList.remove('empty', 'loading');
        }
    }

    setupLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreProjects');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProjects();
            });
        }
    }

    loadMoreProjects() {
        const gallery = document.getElementById('projectsGallery');
        gallery.classList.add('loading');
        
        // Simulate loading delay
        setTimeout(() => {
            this.currentPage++;
            this.renderProjects(true);
            gallery.classList.remove('loading');
        }, 1000);
    }

    renderProjects(append = false) {
        const gallery = document.getElementById('projectsGallery');
        if (!gallery) return;

        const startIndex = append ? (this.currentPage - 1) * this.projectsPerPage : 0;
        const endIndex = this.currentPage * this.projectsPerPage;
        const projectsToShow = this.filteredProjects.slice(startIndex, endIndex);

        if (!append) {
            gallery.innerHTML = '';
        }

        projectsToShow.forEach(project => {
            const projectElement = this.createProjectElement(project);
            gallery.appendChild(projectElement);
        });

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreProjects');
        if (loadMoreBtn) {
            const hasMore = endIndex < this.filteredProjects.length;
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        }

        // Animate new projects
        this.animateProjects();
    }

    createProjectElement(project) {
        const projectDiv = document.createElement('div');
        projectDiv.className = `project-item ${project.featured ? 'featured' : ''}`;
        projectDiv.dataset.category = project.category;

        projectDiv.innerHTML = `
            <div class="project-image">
                <div class="image-placeholder">${project.image}</div>
                <div class="project-overlay">
                    <button class="view-3d-btn" onclick="view3DProject('${project.id}')">View in 3D</button>
                    <button class="project-details-btn" onclick="showProjectDetails('${project.id}')">Details</button>
                </div>
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p class="project-location">📍 ${project.location}</p>
                <p class="project-description">${project.description}</p>
                <div class="project-details">
                    <span class="detail-item">📅 Completed ${project.year}</span>
                    <span class="detail-item">🏗️ ${project.size}</span>
                </div>
                <div class="project-highlights">
                    ${project.features.map(feature => `<span class="highlight">${feature}</span>`).join('')}
                </div>
            </div>
        `;

        return projectDiv;
    }

    animateProjects() {
        const projects = document.querySelectorAll('.project-item');
        projects.forEach((project, index) => {
            // Remove any existing classes
            project.classList.remove('hidden', 'show');
            
            project.style.opacity = '0';
            project.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                project.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                project.style.opacity = '1';
                project.style.transform = 'translateY(0)';
                project.classList.add('show');
            }, index * 100);
        });
    }

    getProjectById(id) {
        return this.allProjects.find(project => project.id === id);
    }
}

// Global functions for project interactions
function view3DProject(projectId) {
    // Close modal if open
    closeProjectModal();
    
    // Redirect to 3D viewer with specific project
    window.location.href = `project-viewer.html?project=${projectId}`;
}

function showProjectDetails(projectId) {
    const project = window.projectsManager.getProjectById(projectId);
    if (!project) return;

    // Create and show modal
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    // Update modal content
    document.getElementById('modalProjectTitle').textContent = project.title;
    document.getElementById('modalProjectImage').textContent = project.image;
    
    const modalInfo = document.getElementById('modalProjectInfo');
    modalInfo.innerHTML = `
        <p><strong>Location:</strong> ${project.location}</p>
        <p><strong>Completed:</strong> ${project.year}</p>
        <p><strong>Size:</strong> ${project.size}</p>
        <p><strong>Category:</strong> ${project.category.charAt(0).toUpperCase() + project.category.slice(1)}</p>
        <p><strong>Description:</strong> ${project.description}</p>
        <div class="project-features-detailed">
            <h4>Key Features:</h4>
            <ul>
                ${project.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
    `;

    // Update footer buttons
    document.getElementById('modalView3D').onclick = () => view3DProject(project.id);
    document.getElementById('modalGetEstimate').onclick = () => {
        window.location.href = `estimator.html?type=${project.category}`;
    };

    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('projectsGallery')) {
        window.projectsManager = new ProjectsManager();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsManager;
}

// Add keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('projectModal');
    if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    }
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('projectModal');
    if (modal && modal.classList.contains('active')) {
        if (e.target.classList.contains('modal-overlay')) {
            closeProjectModal();
        }
    }
});
