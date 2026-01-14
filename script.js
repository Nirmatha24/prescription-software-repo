const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const addMedBtn = document.getElementById('addMedBtn');
    const medList = document.getElementById('medList');
    const generateBtn = document.getElementById('generateBtn');

    // New Elements for Save/History
    const saveBtn = document.getElementById('saveBtn');
    const historyBtn = document.getElementById('historyBtn');
    const historyPanel = document.getElementById('historyPanel');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyList = document.getElementById('historyList');

    // Logo upload elements
    const logoInput = document.getElementById('logoInput');
    const logoUploadArea = document.getElementById('logoUploadArea');
    const logoPreview = document.getElementById('logoPreview');
    const defaultLogoIcon = document.getElementById('defaultLogoIcon');
    const defaultLogoText = document.getElementById('defaultLogoText');

    let logoBase64 = null;

    // Load saved logo
    const savedLogo = localStorage.getItem('prescriptionLogo');
    if (savedLogo) {
        logoBase64 = savedLogo;
        logoPreview.src = logoBase64;
        logoPreview.style.display = 'block';
        defaultLogoIcon.style.display = 'none';
        defaultLogoText.style.display = 'none';
    }

    // Add initial empty row
    addMedRow();

    // Event Listeners
    addMedBtn.addEventListener('click', addMedRow);
    generateBtn.addEventListener('click', generatePDF);

    // Save/History Event Listeners
    saveBtn.addEventListener('click', savePrescription);
    historyBtn.addEventListener('click', () => {
        renderHistory();
        historyPanel.style.right = '0';
    });
    closeHistoryBtn.addEventListener('click', () => {
        historyPanel.style.right = '-400px';
    });

    // Logo Upload Logic
    logoUploadArea.addEventListener('click', () => {
        logoInput.click();
    });

    logoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                logoBase64 = event.target.result;
                logoPreview.src = logoBase64;
                logoPreview.style.display = 'block';
                defaultLogoIcon.style.display = 'none';
                defaultLogoText.style.display = 'none';

                // Save to localStorage
                localStorage.setItem('prescriptionLogo', logoBase64);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Medicine Auto-Complete Data ---
    const commonMedicines = [
        { name: "Paracetamol", type: "TAB", strength: "500mg", generic: "Paracetamol" },
        { name: "Paracetamol", type: "TAB", strength: "650mg", generic: "Paracetamol" },
        { name: "Amoxicillin", type: "CAP", strength: "500mg", generic: "Amoxicillin" },
        { name: "Metformin", type: "TAB", strength: "500mg", generic: "Metformin" },
        { name: "Metformin", type: "TAB", strength: "1000mg", generic: "Metformin" },
        { name: "Atorvastatin", type: "TAB", strength: "10mg", generic: "Atorvastatin" },
        { name: "Atorvastatin", type: "TAB", strength: "20mg", generic: "Atorvastatin" },
        { name: "Pantoprazole", type: "TAB", strength: "40mg", generic: "Pantoprazole" },
        { name: "Omeprazole", type: "CAP", strength: "20mg", generic: "Omeprazole" },
        { name: "Azithromycin", type: "TAB", strength: "500mg", generic: "Azithromycin" },
        { name: "Ciprofloxacin", type: "TAB", strength: "500mg", generic: "Ciprofloxacin" },
        { name: "Cetirizine", type: "TAB", strength: "10mg", generic: "Cetirizine" },
        { name: "Levocetirizine", type: "TAB", strength: "5mg", generic: "Levocetirizine" },
        { name: "Montelukast", type: "TAB", strength: "10mg", generic: "Montelukast" },
        { name: "Amlodipine", type: "TAB", strength: "5mg", generic: "Amlodipine" },
        { name: "Telmisartan", type: "TAB", strength: "40mg", generic: "Telmisartan" },
        { name: "Losartan", type: "TAB", strength: "50mg", generic: "Losartan" },
        { name: "Aspirin", type: "TAB", strength: "75mg", generic: "Acetylsalicylic Acid" },
        { name: "Clopidogrel", type: "TAB", strength: "75mg", generic: "Clopidogrel" },
        { name: "Ranitidine", type: "TAB", strength: "150mg", generic: "Ranitidine" },
        { name: "Diclofenac", type: "TAB", strength: "50mg", generic: "Diclofenac" },
        { name: "Aceclofenac", type: "TAB", strength: "100mg", generic: "Aceclofenac" },
        { name: "Ibuprofen", type: "TAB", strength: "400mg", generic: "Ibuprofen" },
        { name: "Vildagliptin", type: "TAB", strength: "50mg", generic: "Vildagliptin" },
        { name: "Glimepiride", type: "TAB", strength: "1mg", generic: "Glimepiride" },
        { name: "Glimepiride", type: "TAB", strength: "2mg", generic: "Glimepiride" },
        { name: "Thyroxine", type: "TAB", strength: "25mcg", generic: "Levothyroxine" },
        { name: "Thyroxine", type: "TAB", strength: "50mcg", generic: "Levothyroxine" },
        { name: "Thyroxine", type: "TAB", strength: "100mcg", generic: "Levothyroxine" },
        { name: "Dolo", type: "TAB", strength: "650mg", generic: "Paracetamol" },
        { name: "Augmentin", type: "TAB", strength: "625mg", generic: "Amoxicillin + Clavulanic Acid" }
    ];

    // Populate Datalist
    const medSuggestions = document.getElementById('medSuggestions');
    if (medSuggestions) {
        // Use a Set to avoid duplicates if any
        const uniqueNames = [...new Set(commonMedicines.map(m => m.name))];
        uniqueNames.sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            medSuggestions.appendChild(option);
        });
    }

    // Function to add a new medicine row
    function addMedRow() {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td style="display: flex; gap: 5px;">
                <select class="med-type" style="width: 80px;">
                    <option value="TAB">TAB</option>
                    <option value="CAP">CAP</option>
                    <option value="SYP">SYP</option>
                    <option value="OINT">OINT</option>
                    <option value="INJ">INJ</option>
                    <option value="DROP">DROP</option>
                </select>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; gap: 5px;">
                        <input type="text" placeholder="e.g. Amoxicillin" class="med-name" list="medSuggestions" style="flex: 1;">
                        <input type="text" placeholder="500mg" class="med-strength" style="width: 80px; font-size: 0.9em;">
                    </div>
                    <input type="text" placeholder="(Composition)" class="med-generic" style="width: 100%; font-size: 0.85em; color: #666;">
                </div>
            </td>
            <td><input type="text" list="dosageOptions" placeholder="1-0-1" class="med-dose"></td>
            <td><input type="text" list="durOptions" placeholder="5 Days" class="med-duration"></td>
            <td><input type="text" list="instrOptions" placeholder="After food" class="med-advice"></td>
            <td><input type="text" list="freqOptions" placeholder="Daily" class="med-freq"></td>
            <td class="action-col">
                <button type="button" class="btn btn-icon delete-btn" onclick="this.closest('tr').remove()">
                    &times;
                </button>
            </td>
        `;

        medList.appendChild(row);

        const nameInput = row.querySelector('.med-name');

        // Focus on the name input
        nameInput.focus();

        // Attach Auto-Complete Logic
        nameInput.addEventListener('input', (e) => handleMedInput(e.target, row));
    }

    // Auto-complete Handler
    function handleMedInput(input, row) {
        const val = input.value;
        // Find exact match (case insensitive)
        const match = commonMedicines.find(m => m.name.toLowerCase() === val.toLowerCase());

        if (match) {
            // Auto-fill details
            const typeSelect = row.querySelector('.med-type');
            const strengthInput = row.querySelector('.med-strength');
            const genericInput = row.querySelector('.med-generic');

            if (match.type) typeSelect.value = match.type;
            if (match.strength) strengthInput.value = match.strength;
            if (match.generic) genericInput.value = `(${match.generic})`;
        }
    }

    // Function to generate PDF
    function generatePDF() {
        const doc = new jsPDF();

        // --- 1. Header Layout ---
        // Left: Dr Info
        const docName = document.getElementById('docName').value || 'Dr. Anand P S';
        const docQual = document.getElementById('docQual').value || 'MBBS, Medical Officer';
        const docHosp = document.getElementById('docHosp').value || 'FHC Angamoozhy';
        const docReg = document.getElementById('docReg').value || 'TCMC: 86987';

        // Right: Contact Info
        const docMob = document.getElementById('docMob').value || '7558910321';
        const docEmail = document.getElementById('docEmail').value || 'dranandps24@gmail.com';

        // --- Logo ---
        if (logoBase64) {
            // Add logo centered in the header
            const pageWidth = doc.internal.pageSize.getWidth();
            const imgWidth = 20;
            const imgHeight = 20;
            const xPos = (pageWidth - imgWidth) / 2;

            doc.addImage(logoBase64, 'PNG', xPos, 15, imgWidth, imgHeight);
        }

        // Font settings
        doc.setFont("times", "bold");
        doc.setFont("times", "bold");
        doc.setFontSize(22); // Larger Name
        const nameWidth = doc.getTextWidth(docName); // Calculate width BEFORE changing font size
        doc.text(docName, 15, 20);

        doc.setFontSize(14);
        doc.text(docQual.split(',')[0], 15 + nameWidth + 3, 20); // MBBS next to name, precise padding

        doc.setFont("times", "normal");
        doc.setFontSize(11);

        // Stacked info below name
        let currentY = 26;
        const qualities = docQual.split(',').slice(1).join(',').trim();
        if (qualities) {
            doc.text(qualities, 15, currentY);
            currentY += 5;
        }

        doc.text(docHosp, 15, currentY);
        currentY += 5;

        doc.text(docReg, 15, currentY);
        currentY += 5;

        // Extra Header Info
        const headerExtraVal = document.getElementById('headerExtra').value;
        if (headerExtraVal) {
            const extraLines = doc.splitTextToSize(headerExtraVal, 80);
            doc.text(extraLines, 15, currentY);
            currentY += (extraLines.length * 5);
        }

        // Right Side Contact
        doc.setFontSize(11);
        doc.text(`Mob : ${docMob}`, 140, 25);
        doc.text(`Email : ${docEmail}`, 140, 31);

        // Horizontal Lines (Double)
        const lineY = Math.max(45, currentY + 2);
        doc.setLineWidth(1);
        doc.line(15, lineY, 195, lineY); // Thick top line
        doc.setLineWidth(0.5);
        doc.line(15, lineY + 1.5, 195, lineY + 1.5); // Thin bottom line

        // --- 2. Patient Info ---
        const patName = document.getElementById('patName').value || '___________';
        const patAge = document.getElementById('patAge').value || '__';
        const patSex = document.getElementById('patSex').value || '__';
        const date = document.getElementById('visitDate').value || new Date().toISOString().split('T')[0];
        const diagnosis = document.getElementById('diagnosis').value || '';

        doc.setFontSize(11);
        doc.setFont("times", "normal");

        // User requested format: "Patient Name: Name   Age/Sex: Age / Sex"
        // Move down due to larger header
        const patY = lineY + 10;
        doc.text(`Patient Name: ${patName}`, 15, patY);
        doc.text(`Age/Sex: ${patAge} / ${patSex}`, 90, patY); // Middle-ish
        doc.text(`Date: ${date}`, 160, patY);

        if (diagnosis) {
            doc.setFont("times", "normal"); // Regular font
            // Left aligned as requested
            // Moved down to add 1 line space between Name and Diagnosis (patY + 14)
            doc.text(`Diagnosis- ? ${diagnosis}`, 15, patY + 14);
        }

        // --- 3. Rx Symbol ---
        doc.setFont("times", "bold");
        doc.setFontSize(20);
        // Added extra spacing (approx 3 lines) between Diagnosis and Rx
        // Shifted down further to account for Diagnosis move (patY + 46)
        const rxY = patY + 46;
        doc.text("Rx", 15, rxY);

        // --- 4. Medicine Table ---
        const rows = document.querySelectorAll('#medList tr');
        const tableBody = [];

        doc.setFont("times", "normal");
        doc.setFontSize(11);

        rows.forEach((row, index) => {
            const type = row.querySelector('.med-type').value;
            const name = row.querySelector('.med-name').value;
            // Handle null possibility if row structure messed up (safety)
            const strengthInput = row.querySelector('.med-strength');
            const strength = strengthInput ? strengthInput.value : '';
            const generic = row.querySelector('.med-generic').value;
            const dose = row.querySelector('.med-dose').value;
            const freq = row.querySelector('.med-freq').value;
            const dur = row.querySelector('.med-duration').value;
            const adviceInput = row.querySelector('.med-advice');
            const advice = adviceInput ? adviceInput.value : '';

            if (name) {
                // Construct Medicine cell content
                // <Number>. <Type> <Name> <Strength>
                //          (<Generic>)
                let medCell = `${index + 1}. ${type} ${name}`;
                if (strength) medCell += ` ${strength}`;

                if (generic) {
                    medCell += `\n   (${generic})`;
                }

                tableBody.push([
                    medCell,
                    dose,
                    "X", // Static Separator
                    dur,
                    advice,
                    freq
                ]);
            }
        });

        if (tableBody.length > 0) {
            doc.autoTable({
                body: tableBody,
                startY: rxY + 5,
                theme: 'plain',
                styles: {
                    fontSize: 12,
                    cellPadding: 3,
                    font: 'times',
                    valign: 'top',
                    textColor: 0
                },
                columnStyles: {
                    0: { cellWidth: 80 }, // Name
                    1: { cellWidth: 20 }, // Dose
                    2: { cellWidth: 10, halign: 'center' }, // X
                    3: { cellWidth: 25 }, // Duration
                    4: { cellWidth: 30 }, // Advice
                    5: { cellWidth: 25 }  // Frequency
                }
            });
        }

        // --- 5. General Advice ---
        const generalAdvice = document.getElementById('generalAdvice').value;
        if (generalAdvice) {
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : rxY + 20;
            doc.setFont("times", "bold");
            doc.text("General Advice / Instructions:", 15, finalY + 10);
            doc.setFont("times", "normal");

            const adviceLines = doc.splitTextToSize(generalAdvice, 180);
            doc.text(adviceLines, 15, finalY + 16);
        }

        // Save
        doc.save(`${patName || 'Patient'}_Prescription.pdf`);
    }

    // --- Save & History Functions ---

    function savePrescription() {
        const patName = document.getElementById('patName').value || 'Unknown Patient';
        const visitDate = document.getElementById('visitDate').value || new Date().toISOString().split('T')[0];

        // Harvest Medicine Data
        const medRows = [];
        document.querySelectorAll('#medList tr').forEach(row => {
            medRows.push({
                type: row.querySelector('.med-type').value,
                name: row.querySelector('.med-name').value,
                strength: row.querySelector('.med-strength').value,
                generic: row.querySelector('.med-generic').value,
                dose: row.querySelector('.med-dose').value,
                duration: row.querySelector('.med-duration').value,
                freq: row.querySelector('.med-freq').value,
                advice: row.querySelector('.med-advice').value
            });
        });

        const data = {
            id: Date.now(),
            savedAt: new Date().toLocaleString(),
            header: {
                docName: document.getElementById('docName').value,
                docQual: document.getElementById('docQual').value,
                docHosp: document.getElementById('docHosp').value,
                docReg: document.getElementById('docReg').value,
                headerExtra: document.getElementById('headerExtra').value,
                docMob: document.getElementById('docMob').value,
                docEmail: document.getElementById('docEmail').value
            },
            patient: {
                name: patName,
                age: document.getElementById('patAge').value,
                sex: document.getElementById('patSex').value,
                date: visitDate,
                diagnosis: document.getElementById('diagnosis').value
            },
            medicines: medRows,
            generalAdvice: document.getElementById('generalAdvice').value
        };

        const saved = JSON.parse(localStorage.getItem('prescriptionHistory') || '[]');
        saved.push(data);
        localStorage.setItem('prescriptionHistory', JSON.stringify(saved));

        alert('Prescription Saved Successfully!');
    }

    function renderHistory() {
        const saved = JSON.parse(localStorage.getItem('prescriptionHistory') || '[]');
        historyList.innerHTML = '';

        if (saved.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #718096; margin-top: 20px;">No saved prescriptions.</p>';
            return;
        }

        // Sort by newest first
        saved.reverse().forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-card';

            card.innerHTML = `
                <div class="history-card-header">
                    <div>
                        <h4>${item.patient.name}</h4>
                        <small>${item.patient.date}</small>
                    </div>
                    <button class="delete-history-btn" data-id="${item.id}">&times;</button>
                </div>
                <div class="history-diagnosis">
                    ${item.patient.diagnosis || 'No Diagnosis'}
                </div>
                <button class="load-btn" data-id="${item.id}">Load</button>
            `;
            historyList.appendChild(card);
        });

        // Attach listeners
        document.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => loadPrescription(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deletePrescription(e.target.dataset.id));
        });
    }

    function loadPrescription(id) {
        const saved = JSON.parse(localStorage.getItem('prescriptionHistory') || '[]');
        const item = saved.find(i => i.id == id); // Loose equality for string/number match

        if (!item) return;

        // Restore Header
        if (item.header) {
            document.getElementById('docName').value = item.header.docName || '';
            document.getElementById('docQual').value = item.header.docQual || '';
            document.getElementById('docHosp').value = item.header.docHosp || '';
            document.getElementById('docReg').value = item.header.docReg || '';
            document.getElementById('headerExtra').value = item.header.headerExtra || '';
            document.getElementById('docMob').value = item.header.docMob || '';
            document.getElementById('docEmail').value = item.header.docEmail || '';
        }

        // Restore Patient
        document.getElementById('patName').value = item.patient.name || '';
        document.getElementById('patAge').value = item.patient.age || '';
        document.getElementById('patSex').value = item.patient.sex || 'Male';
        document.getElementById('visitDate').value = item.patient.date || '';
        document.getElementById('diagnosis').value = item.patient.diagnosis || '';

        // Restore Medicines
        medList.innerHTML = ''; // Clear current list
        if (item.medicines && item.medicines.length > 0) {
            item.medicines.forEach(med => {
                addMedRowWithValues(med);
            });
        } else {
            addMedRow(); // Add empty if none
        }

        // Restore Device
        document.getElementById('generalAdvice').value = item.generalAdvice || '';

        // Close panel
        historyPanel.style.right = '-400px';
    }

    function addMedRowWithValues(medData) {
        // Reuse logic but populate values
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="display: flex; gap: 5px;">
                <select class="med-type" style="width: 80px;">
                    <option value="TAB" ${medData.type === 'TAB' ? 'selected' : ''}>TAB</option>
                    <option value="CAP" ${medData.type === 'CAP' ? 'selected' : ''}>CAP</option>
                    <option value="SYP" ${medData.type === 'SYP' ? 'selected' : ''}>SYP</option>
                    <option value="OINT" ${medData.type === 'OINT' ? 'selected' : ''}>OINT</option>
                    <option value="INJ" ${medData.type === 'INJ' ? 'selected' : ''}>INJ</option>
                    <option value="DROP" ${medData.type === 'DROP' ? 'selected' : ''}>DROP</option>
                </select>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; gap: 5px;">
                        <input type="text" placeholder="e.g. Amoxicillin" class="med-name" list="medSuggestions" value="${medData.name}" style="flex: 1;">
                        <input type="text" placeholder="500mg" class="med-strength" value="${medData.strength}" style="width: 80px; font-size: 0.9em;">
                    </div>
                    <input type="text" placeholder="(Composition)" class="med-generic" value="${medData.generic}" style="width: 100%; font-size: 0.85em; color: #666;">
                </div>
            </td>
            <td><input type="text" list="dosageOptions" placeholder="1-0-1" class="med-dose" value="${medData.dose}"></td>
            <td><input type="text" list="durOptions" placeholder="5 Days" class="med-duration" value="${medData.duration}"></td>
            <td><input type="text" list="instrOptions" placeholder="After food" class="med-advice" value="${medData.advice}"></td>
            <td><input type="text" list="freqOptions" placeholder="Daily" class="med-freq" value="${medData.freq}"></td>
            <td class="action-col">
                <button type="button" class="btn btn-icon delete-btn" onclick="this.closest('tr').remove()">
                    &times;
                </button>
            </td>
        `;
        medList.appendChild(row);

        // Attach Auto-Complete Logic
        row.querySelector('.med-name').addEventListener('input', (e) => handleMedInput(e.target, row));
    }

    function deletePrescription(id) {
        if (!confirm('Are you sure you want to delete this saved prescription?')) return;

        let saved = JSON.parse(localStorage.getItem('prescriptionHistory') || '[]');
        saved = saved.filter(item => item.id != id);
        localStorage.setItem('prescriptionHistory', JSON.stringify(saved));
        renderHistory();
    }

});
