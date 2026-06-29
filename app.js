if (
    !window.location.pathname.includes("login.html") &&
    localStorage.getItem("isLoggedIn") !== "true"
) {
    window.location.replace("login.html");
}
function logout(){
    localStorage.removeItem("isLoggedIn");
    window.location.replace("login.html");
}
// Initialize page elements when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initNavbar();
    initFormCounters();
    initDashboard();
    initContactForm();
});

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    // Auto remove toast
    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease reverse forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// --- NAVBAR & MOBILE MENU LOGIC ---
function initNavbar() {
    const header = document.querySelector('.navbar-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

    // Sticky Scroll Header Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        updateActiveLink();
    });

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.style.display === 'flex';
        mobileMenu.style.display = isOpen ? 'none' : 'flex';
        
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
            lucide.createIcons();
        }
    });

    // Close Mobile Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.style.display = 'none';
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });
    });

    // Active link highlighting on scroll
    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;
        let activeId = 'home';

        document.querySelectorAll('section').forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                activeId = id;
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }
}

// --- FORM CHARACTER COUNTERS ---
function initFormCounters() {
    const textareas = [
        { id: 'project-deliverables', countId: 'count-deliverables' },
        { id: 'client-feedback', countId: 'count-feedback' },
        { id: 'lessons-learned', countId: 'count-lessons' }
    ];

    textareas.forEach(textareaSpec => {
        const textarea = document.getElementById(textareaSpec.id);
        const counter = document.getElementById(textareaSpec.countId);
        if (!textarea || !counter) return;

        textarea.addEventListener('input', () => {
            const length = textarea.value.length;
            counter.innerText = `${length} characters`;
        });
    });
}

// --- CORE DASHBOARD INTERACTION ---
function initDashboard() {
    const form = document.getElementById('project-closure-form');
    const loadSampleBtn = document.getElementById('load-sample-btn');
    const submitBtn = document.getElementById('submit-btn');
    const retryBtn = document.getElementById('retry-btn');
    
    // Output states
    const statePreGen = document.getElementById('state-pre-gen');
    const stateGenerating = document.getElementById('state-generating');
    const stateReportReady = document.getElementById('state-report-ready');
    const stateError = document.getElementById('state-error');
    const reportStatusTag = document.getElementById('report-status-tag');
    
    // Meta fields
    const repProjTitle = document.getElementById('rep-proj-title');
    const repProjManager = document.getElementById('rep-proj-manager');
    const repProjId = document.getElementById('rep-proj-id');
    const repProjDate = document.getElementById('rep-proj-date');
    const reportTextContainer = document.getElementById('report-text-container');
    
    // Sidebar Utilities
    const copyBtn = document.getElementById('copy-report-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const regenerateBtn = document.getElementById('regenerate-report-btn');
    const ratingWidget = document.getElementById('rating-widget');
    const ratingCommentInput = document.getElementById('rating-comment');
    const submitRatingBtn = document.getElementById('submit-rating-btn');
    const starContainer = document.getElementById('star-rating');
    const historyContainer = document.getElementById('report-history-container');

    // State parameters
    let activeReport = null;
    let selectedRatingValue = 0;
    
    // persist history database in localStorage
    let reportsHistory = JSON.parse(localStorage.getItem('brandsparkx_reports_history') || '[]');
    
    // Sample pre-filled data object
    const sampleData = {
        name: "Enterprise ERP Cloud Handoff",
        manager: "Kieran Varma",
        deliverables: "1. Migrated 4 on-prem legacy database systems to cloud clusters with zero service interruptions.\n2. Configured security IAM access tokens, multi-factor logins, and enterprise VPN tunnels.\n3. Audited page loading velocity, achieving an average response rate of 1.4s (reduced from 5s).",
        feedback: "\"The transition was incredibly smooth. We expected at least a weekend of system downtime, but our staff was able to login and query records without delays. Great documentation handover.\"",
        lessons: "1. Legacy database schema mapping was more fragmented than expected, requiring 14 hours of manual cleaning.\n2. Early user acceptance tests prevented several dashboard integration glitches."
    };

    // Initialize application state
    renderHistory();
    updateAnalytics();
    
    // Load Sample Click Event
    loadSampleBtn.addEventListener('click', () => {
        document.getElementById('project-name').value = sampleData.name;
        document.getElementById('project-manager').value = sampleData.manager;
        document.getElementById('project-deliverables').value = sampleData.deliverables;
        document.getElementById('client-feedback').value = sampleData.feedback;
        document.getElementById('lessons-learned').value = sampleData.lessons;
        
        // Trigger character counter updates manually
        document.getElementById('count-deliverables').innerText = `${sampleData.deliverables.length} characters`;
        document.getElementById('count-feedback').innerText = `${sampleData.feedback.length} characters`;
        document.getElementById('count-lessons').innerText = `${sampleData.lessons.length} characters`;
        
        showToast("Sample project closure data loaded.", "success");
    });

    // Form Submission / Report Generation
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        runGenerationPipeline();
    });

    retryBtn.addEventListener('click', () => {
        runGenerationPipeline();
    });

    regenerateBtn.addEventListener('click', () => {
        runGenerationPipeline();
    });

    function runGenerationPipeline() {
        const nameVal = document.getElementById('project-name').value.trim();
        const managerVal = document.getElementById('project-manager').value.trim();
        const deliverablesVal = document.getElementById('project-deliverables').value.trim();
        const feedbackVal = document.getElementById('client-feedback').value.trim();
        const lessonsVal = document.getElementById('lessons-learned').value.trim();

        if (!nameVal || !managerVal || !deliverablesVal || !feedbackVal || !lessonsVal) {
            showToast("Please complete all required fields.", "error");
            return;
        }

        // Show generating state loader
        statePreGen.style.display = 'none';
        stateReportReady.style.display = 'none';
        stateError.style.display = 'none';
        stateGenerating.style.display = 'flex';
        
        reportStatusTag.innerText = "Analyzing";
        reportStatusTag.className = "status-badge status-generating";
        
        // Reset sidebar actions
        copyBtn.disabled = true;
        exportPdfBtn.disabled = true;
        regenerateBtn.disabled = true;
        ratingWidget.classList.add('disabled-block');
        resetRatingWidget();

        // Sequence simulation logs
        const steps = [
            document.getElementById('step-1'),
            document.getElementById('step-2'),
            document.getElementById('step-3'),
            document.getElementById('step-4')
        ];

        steps.forEach((step, index) => {
            step.className = index === 0 ? "step-line active" : "step-line";
        });

        // Simulate multi-step compilation
        setTimeout(() => {
            steps[0].className = "step-line";
            steps[1].className = "step-line active";
            
            setTimeout(() => {
                steps[1].className = "step-line";
                steps[2].className = "step-line active";
                
                setTimeout(() => {
                    steps[2].className = "step-line";
                    steps[3].className = "step-line active";
                    
                    setTimeout(() => {
                        // Success completion
                        compileReport(nameVal, managerVal, deliverablesVal, feedbackVal, lessonsVal);
                    }, 400);
                }, 400);
            }, 400);
        }, 450);
    }

    // Compile actual report and display
    function compileReport(name, manager, deliverables, feedback, lessons) {
        // Hide loader, show report view
        stateGenerating.style.display = 'none';
        stateReportReady.style.display = 'flex';
        
        reportStatusTag.innerText = "Completed";
        reportStatusTag.className = "status-badge status-success";

        const sysId = `BSP-${Math.floor(1000 + Math.random() * 9000)}-AI`;
        const dateStr = new Date().toISOString().split('T')[0];

        // Format Report HTML content
        const reportHTML = constructReportHTML(name, manager, deliverables, feedback, lessons, dateStr, sysId);
        
        repProjTitle.innerText = name;
        repProjManager.innerText = manager;
        repProjId.innerText = sysId;
        repProjDate.innerText = dateStr;
        reportTextContainer.innerHTML = reportHTML;

        // Save report into active workspace state
        activeReport = {
            id: 'report-' + Date.now(),
            name: name,
            manager: manager,
            sysId: sysId,
            date: dateStr,
            deliverables: deliverables,
            feedback: feedback,
            lessons: lessons,
            htmlContent: reportHTML,
            rating: 0,
            ratingComment: ""
        };

        // Add to history database
        reportsHistory.unshift(activeReport);
        localStorage.setItem('brandsparkx_reports_history', JSON.stringify(reportsHistory));
        
        // Unlock sidebar utilities
        unlockSidebarActions();
        
        // Re-render components
        renderHistory();
        updateAnalytics();
        
        // Highlight active list item
        highlightActiveHistoryItem(activeReport.id);
        
        showToast("Report generated successfully.", "success");
    }

    function constructReportHTML(name, manager, deliverables, feedback, lessons, date, id) {
        const deliverablesList = deliverables.split('\n')
            .map(item => item.trim())
            .filter(item => item)
            .map(item => `<li><strong>[Verified]</strong> ${item}</li>`)
            .join('');

        const lessonsList = lessons.split('\n')
            .map(item => item.trim())
            .filter(item => item)
            .map(item => `<li>${item}</li>`)
            .join('');

        return `
            <h3>1. Executive Project Summary</h3>
            <p>This document verifies the formal closure and administrative handoff of the project <strong>"${name}"</strong> led by Project Manager <strong>${manager}</strong>. Initiated to resolve core department capabilities, all deliverables have been executed in compliance with operational objectives. The project is transitioned to client maintenance support phase.</p>
            
            <h3>2. Deliverables Checklist & Integrity Audit</h3>
            <ul>
                ${deliverablesList || '<li>No specific deliverables checklist supplied. General transition completed.</li>'}
                <li><strong>Quality Metric:</strong> Handoff validation completed against target metrics with zero critical bugs.</li>
                <li><strong>Security Audit:</strong> Operations evaluated. Database encryption protocols successfully configured.</li>
            </ul>
            
            <h3>3. Stakeholder Sentiment & Feedback Analysis</h3>
            <blockquote>
                <p>"${feedback}"</p>
            </blockquote>
            <p><strong>Sentiment Insights:</strong> Natural language processing indicates highly aligned outcomes, showing satisfaction in deployment speed, communication flow, and delivery accuracy.</p>
            
            <h3>4. Lessons Learned & Recommendations</h3>
            <ul>
                ${lessonsList || '<li>No technical hurdles documented. Future efforts will inherit standard agile templates.</li>'}
                <li><strong>Optimization Action:</strong> Document configuration workflows to prevent legacy translation friction on future deployments.</li>
            </ul>
            
            <h3>5. Transition Sign-Off</h3>
            <p>With all objectives certified, assets archived, and client validation finalized, this project is declared officially closed.</p>
            <ul>
                <li><strong>PMO Sign-off Authority:</strong> Brandsparkx Governance Council</li>
                <li><strong>Date of Closure:</strong> ${date}</li>
                <li><strong>Report Integrity Reference ID:</strong> ${id}</li>
            </ul>
        `;
    }

    // Side Actions Unlocker
    function unlockSidebarActions() {
        copyBtn.disabled = false;
        exportPdfBtn.disabled = false;
        regenerateBtn.disabled = false;
        ratingWidget.classList.remove('disabled-block');
    }

    // Rating star handler
    const starButtons = starContainer.querySelectorAll('.star-btn');
    starButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = parseInt(btn.getAttribute('data-value'), 10);
            selectedRatingValue = value;
            highlightStars(value);
        });
    });

    function highlightStars(value) {
        starButtons.forEach(btn => {
            const starValue = parseInt(btn.getAttribute('data-value'), 10);
            if (starValue <= value) {
                btn.classList.add('active-star');
            } else {
                btn.classList.remove('active-star');
            }
        });
    }

    function resetRatingWidget() {
        selectedRatingValue = 0;
        highlightStars(0);
        ratingCommentInput.value = '';
    }

    // Submit rating event
    submitRatingBtn.addEventListener('click', () => {
        if (!activeReport) return;
        if (selectedRatingValue === 0) {
            showToast("Please select a star rating first.", "error");
            return;
        }

        // Find and update report in array
        const reportIndex = reportsHistory.findIndex(r => r.id === activeReport.id);
        if (reportIndex !== -1) {
            reportsHistory[reportIndex].rating = selectedRatingValue;
            reportsHistory[reportIndex].ratingComment = ratingCommentInput.value.trim();
            
            localStorage.setItem('brandsparkx_reports_history', JSON.stringify(reportsHistory));
            
            // Show toast message
            showToast("Thank you for your quality feedback.", "success");
            
            // Update analytics display
            updateAnalytics();
        }
    });

    // Copy To Clipboard Handler
    copyBtn.addEventListener('click', () => {
        if (!activeReport) return;
        const text = reportTextContainer.innerText;
        navigator.clipboard.writeText(text).then(() => {
            showToast("Report plain text copied to clipboard.", "success");
        }).catch(() => {
            showToast("Failed to copy report text.", "error");
        });
    });

    // Export PDF Print trigger
    exportPdfBtn.addEventListener('click', () => {
        if (!activeReport) return;
        window.print();
    });

    // Render History sidebar items
    function renderHistory() {
        historyContainer.innerHTML = '';
        
        if (reportsHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state-box padding-tb-lg text-center" style="padding: 24px 0;">
                    <i data-lucide="history" style="width: 20px; height: 20px; color: var(--secondary-color); margin-bottom: 8px;"></i>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">No reports found</p>
                </div>
            `;
            return;
        }

        reportsHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.setAttribute('data-report-id', item.id);
            
            historyItem.innerHTML = `
                <div class="h-info">
                    <span class="h-title">${item.name}</span>
                    <span class="h-date">${item.date} • ${item.manager}</span>
                </div>
                <button type="button" class="h-delete-btn" aria-label="Delete Report">
                    <i data-lucide="trash-2"></i>
                </button>
            `;

            // Click report item to load into workspace viewer
            historyItem.addEventListener('click', (e) => {
                if (e.target.closest('.h-delete-btn')) return;
                loadReportIntoViewer(item);
            });

            // Delete item handler
            const deleteBtn = historyItem.querySelector('.h-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteReport(item.id);
            });

            historyContainer.appendChild(historyItem);
        });

        lucide.createIcons();
    }

    function loadReportIntoViewer(item) {
        activeReport = item;
        
        // Highlight in history sidebar
        highlightActiveHistoryItem(item.id);
        
        // Fill form fields with inputs
        document.getElementById('project-name').value = item.name;
        document.getElementById('project-manager').value = item.manager;
        document.getElementById('project-deliverables').value = item.deliverables;
        document.getElementById('client-feedback').value = item.feedback;
        document.getElementById('lessons-learned').value = item.lessons;

        // Trigger character counter updates manually
        document.getElementById('count-deliverables').innerText = `${item.deliverables.length} characters`;
        document.getElementById('count-feedback').innerText = `${item.feedback.length} characters`;
        document.getElementById('count-lessons').innerText = `${item.lessons.length} characters`;

        // Switch to ready state
        statePreGen.style.display = 'none';
        stateGenerating.style.display = 'none';
        stateError.style.display = 'none';
        stateReportReady.style.display = 'flex';

        // Load meta & report content
        repProjTitle.innerText = item.name;
        repProjManager.innerText = item.manager;
        repProjId.innerText = item.sysId;
        repProjDate.innerText = item.date;
        reportTextContainer.innerHTML = item.htmlContent;
        
        reportStatusTag.innerText = "Completed";
        reportStatusTag.className = "status-badge status-success";

        // Unlock options and pre-fill rating
        unlockSidebarActions();
        resetRatingWidget();
        
        if (item.rating > 0) {
            selectedRatingValue = item.rating;
            highlightStars(item.rating);
            ratingCommentInput.value = item.ratingComment || '';
        }
        
        // Scroll workspace panel to top
        document.getElementById('output-viewer-screen').scrollTop = 0;
    }

    function deleteReport(id) {
        reportsHistory = reportsHistory.filter(r => r.id !== id);
        localStorage.setItem('brandsparkx_reports_history', JSON.stringify(reportsHistory));
        
        renderHistory();
        updateAnalytics();
        
        // Reset output panel if deleted active report
        if (activeReport && activeReport.id === id) {
            activeReport = null;
            stateReportReady.style.display = 'none';
            statePreGen.style.display = 'flex';
            reportStatusTag.innerText = "Ready";
            reportStatusTag.className = "status-badge status-idle";
            
            // Lock action buttons
            copyBtn.disabled = true;
            exportPdfBtn.disabled = true;
            regenerateBtn.disabled = true;
            ratingWidget.classList.add('disabled-block');
            resetRatingWidget();
        }
        
        showToast("Report deleted from history.", "success");
    }

    function highlightActiveHistoryItem(id) {
        document.querySelectorAll('.history-item').forEach(el => {
            if (el.getAttribute('data-report-id') === id) {
                el.classList.add('active-item');
            } else {
                el.classList.remove('active-item');
            }
        });
    }

    // --- ADMIN ANALYTICS CALCULATIONS ---
    function updateAnalytics() {
        const totalReportsCard = document.getElementById('admin-total-reports');
        const avgRatingCard = document.getElementById('admin-avg-rating');
        const feedbackRateCard = document.getElementById('admin-feedback-rate');
        const activePmsCard = document.getElementById('admin-active-pms');
        
        const ratingPlaceholder = document.getElementById('analytics-rating-placeholder');
        const chartPlaceholder = document.getElementById('analytics-chart-placeholder');

        const totalCount = reportsHistory.length;

        if (totalCount === 0) {
            totalReportsCard.innerText = "--";
            avgRatingCard.innerText = "--";
            feedbackRateCard.innerText = "--";
            activePmsCard.innerText = "--";
            
            // Render default empty state structures
            ratingPlaceholder.innerHTML = `
                <div class="empty-state-box">
                    <i data-lucide="award"></i>
                    <p>No quality rating data available.</p>
                    <span class="sub-placeholder">Submit ratings in the workspace sidebar to display metrics.</span>
                </div>
            `;
            
            chartPlaceholder.innerHTML = `
                <div class="empty-state-box">
                    <i data-lucide="trending-up"></i>
                    <p>Awaiting report volume trends...</p>
                    <span class="sub-placeholder">Monthly trends and generation velocity charts will populate here when closure reports are saved.</span>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Calculate Average Quality rating
        const ratedReports = reportsHistory.filter(r => r.rating > 0);
        const ratedCount = ratedReports.length;
        let avgRatingText = "--";
        let ratingPercentageText = "--";
        
        if (ratedCount > 0) {
            const sumRating = ratedReports.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = (sumRating / ratedCount).toFixed(1);
            avgRatingText = `${avgRating} / 5.0`;
            ratingPercentageText = `${Math.round((avgRating / 5) * 100)}%`;
        }

        // Calculate unique Active Project Managers
        const uniquePMs = new Set(reportsHistory.map(r => r.manager.toLowerCase().trim()));
        
        // Calculate Feedbacks / ratings submission rate
        const feedbackRate = totalCount > 0 ? `${Math.round((ratedCount / totalCount) * 100)}%` : "--";

        // Display results
        totalReportsCard.innerText = totalCount;
        avgRatingCard.innerText = avgRatingText;
        feedbackRateCard.innerText = feedbackRate;
        activePmsCard.innerText = uniquePMs.size;

        // Render Rating Distribution Graph Layout if data exists
        if (ratedCount > 0) {
            // Count distribution of stars
            const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            ratedReports.forEach(r => { counts[r.rating]++; });

            let barsHTML = '';
            for (let i = 5; i >= 1; i--) {
                const pct = Math.round((counts[i] / ratedCount) * 100);
                barsHTML += `
                    <div class="rating-bar-row" style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; margin-bottom: 6px; color: var(--text-dark);">
                        <span style="width: 45px; display: inline-flex; align-items: center; gap: 2px;">
                            ${i} <i data-lucide="star" style="width: 12px; height: 12px; fill: #F59E0B; color: #F59E0B;"></i>
                        </span>
                        <div style="flex-grow: 1; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${pct}%; height: 100%; background: var(--primary-bg); border-radius: 4px;"></div>
                        </div>
                        <span style="width: 30px; text-align: right; color: var(--text-muted); font-size: 0.72rem;">${pct}%</span>
                    </div>
                `;
            }

            ratingPlaceholder.innerHTML = `
                <div class="rating-stats-active" style="width: 100%;">
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px;">
                        <span style="font-size: 2.2rem; font-weight: 700; color: var(--primary-bg); line-height: 1;">${(ratedReports.reduce((sum, r) => sum + r.rating, 0) / ratedCount).toFixed(1)}</span>
                        <span style="font-size: 0.88rem; color: var(--text-muted);">average rating out of ${ratedCount} logs</span>
                    </div>
                    ${barsHTML}
                </div>
            `;
        } else {
            ratingPlaceholder.innerHTML = `
                <div class="empty-state-box">
                    <i data-lucide="award"></i>
                    <p>No ratings submitted yet.</p>
                    <span class="sub-placeholder">Submit ratings in the workspace sidebar to display metrics.</span>
                </div>
            `;
        }

        // Render generation trends placeholder (Dynamic Bar chart representation)
        // Group by Date for unique trends
        const dateGroups = {};
        reportsHistory.forEach(r => {
            dateGroups[r.date] = (dateGroups[r.date] || 0) + 1;
        });
        
        const sortedDates = Object.keys(dateGroups).sort().slice(-7); // last 7 days

        if (sortedDates.length > 0) {
            const maxVal = Math.max(...Object.values(dateGroups));
            let chartBarsHTML = '';
            
            sortedDates.forEach(date => {
                const count = dateGroups[date];
                const heightPct = Math.max(10, Math.round((count / maxVal) * 100));
                const shortDate = date.split('-').slice(1).join('/'); // MM/DD
                chartBarsHTML += `
                    <div style="display: flex; flex-direction: column; align-items: center; flex-grow: 1; height: 100%; justify-content: flex-end; gap: 8px;">
                        <span style="font-size: 0.75rem; font-weight: 600; color: var(--primary-bg);">${count}</span>
                        <div style="width: 24px; height: ${heightPct}%; background-color: var(--primary-bg); border-radius: 4px 4px 0 0; transition: height 0.3s ease;"></div>
                        <span style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap;">${shortDate}</span>
                    </div>
                `;
            });

            chartPlaceholder.innerHTML = `
                <div style="width: 100%; height: 160px; display: flex; align-items: flex-end; justify-content: space-around; padding-top: 10px; border-bottom: 1px solid var(--border-color-light);">
                    ${chartBarsHTML}
                </div>
            `;
        } else {
            chartPlaceholder.innerHTML = `
                <div class="empty-state-box">
                    <i data-lucide="trending-up"></i>
                    <p>Awaiting report volume trends...</p>
                    <span class="sub-placeholder">Monthly trends and generation velocity charts will populate here when closure reports are saved.</span>
                </div>
            `;
        }
        
        lucide.createIcons();
    }
}

// --- BRANDSPARKX CONTACT FORM SUBMISSION ---
function initContactForm() {
    const contactForm = document.getElementById('brandsparkx-contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !email || !subject || !message) {
            showToast("All contact form fields are required.", "error");
            return;
        }

        // Simulate network submit
        const submitBtn = document.getElementById('contact-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = "Sending Message...";

        setTimeout(() => {
            showToast("Message sent! Brandsparkx PMO support will contact you shortly.", "success");
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerText = "Send Message";
        }, 1200);
    });
}
