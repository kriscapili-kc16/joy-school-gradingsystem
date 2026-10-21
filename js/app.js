  const firebaseConfig = {
  apiKey: "AIzaSyDjUQUpZta3qjLduBaeVeYDiI11A0D-_sw",
  authDomain: "joy-school-grading-6f8db.firebaseapp.com",
  projectId: "joy-school-grading-6f8db",
  storageBucket: "joy-school-grading-6f8db.firebasestorage.app",
  messagingSenderId: "756120037221",
  appId: "1:756120037221:web:5f2db08c83f22c1dd2638c",
  measurementId: "G-B4S3777RT5"
  };

    let db = null;
    let isCloudConnected = false;
    
    // User & Permission State
    let currentUserRole = "teacher"; 
    let activeTeacherName = "Teacher Account";
    let activeAllowedClasses = ["7A", "8A", "8B", "9A"];
    let currentCommentStudentId = null;

    // Master List of System Class Codes (Persisted & Dynamic)
    let allClassCodes = ["7A", "7B", "8A", "8B", "8C", "9A", "9B", "9C", "10A", "11A"];

    // NATURAL NUMERICAL & ALPHABETICAL SORTER FUNCTION
    function sortClassCodes(arr) {
      if (!arr || !Array.isArray(arr)) return [];
      return [...arr].sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) {
          return numA - numB;
        }
        const secA = a.replace(/[^A-Za-z]/g, '');
        const secB = b.replace(/[^A-Za-z]/g, '');
        return secA.localeCompare(secB);
      });
    }

    const subjectList = [
      { code: "EL", kh: "ភាសាអង់គ្លេសទូទៅ", en: "General English" },
      { code: "GR", kh: "អក្ខរាវិរុទ្ធ", en: "Grammar" },
      { code: "WR", kh: "សរសេរ", en: "Writing" },
      { code: "RE", kh: "អាន", en: "Reading" },
      { code: "ES", kh: "វិទ្យាសាស្ត្រ", en: "Science" },
      { code: "EM", kh: "គណិតវិទ្យា", en: "Math" },
      { code: "CA", kh: "សិល្បៈ", en: "Creative Arts" },
      { code: "PE", kh: "កីឡា", en: "Physical Education" },
      { code: "KE", kh: "ខ្មែរ អង់គ្លេស", en: "Khmer English" },
      { code: "CL", kh: "ភាសាចិន", en: "Chinese Language" }
    ];

    // Teacher Accounts with Section Assignments
    let teachersData = [
      { name: "Teacher Kris", passkey: "1234", classes: ["7A", "8A", "8B", "9A"] },
      { name: "Teacher Sophea", passkey: "1234", classes: ["7B", "8C", "9B", "9C"] },
      { name: "Teacher Dara", passkey: "1234", classes: ["10A", "11A"] },
      { name: "Teacher Jona", passkey: "1234", classes: ["11A"] }
    ];

    // Sample Students with Sections
    const initialStudents = [
      { 
        id: "102945", name: "Princess Sophea", grade: "G7", section: "A", classCode: "7A", gender: "F", 
        comments: { Q1: "Sophea displays excellent participation and study habits across all subjects." },
        scores: { Q1: { EL: 88, RE: 90, GR: 85, WR: 92, EM: 95, ES: 89, CA: 92, PE: 94, KE: 86, CL: 80 } }
      },
      { 
        id: "102946", name: "Chan Dara", grade: "G7", section: "B", classCode: "7B", gender: "M", 
        comments: { Q1: "Dara is making good progress. Encourage more focus in Chinese Language." },
        scores: { Q1: { EL: 75, RE: 80, GR: 78, WR: 82, EM: 85, ES: 80, CA: 88, PE: 90, KE: 75, CL: 70 } }
      },
      { 
        id: "102947", name: "Keo Bopha", grade: "G8", section: "A", classCode: "8A", gender: "F", 
        comments: { Q1: "Bopha maintains outstanding academic standing." },
        scores: { Q1: { EL: 92, RE: 94, GR: 90, WR: 95, EM: 96, ES: 92, CA: 90, PE: 95, KE: 88, CL: 85 } }
      },
      { 
        id: "102948", name: "Sok Veasna", grade: "G8", section: "C", classCode: "8C", gender: "M", 
        comments: { Q1: "Veasna shows good teamwork and analytical skills." },
        scores: { Q1: { EL: 82, RE: 85, GR: 80, WR: 88, EM: 90, ES: 86, CA: 85, PE: 92, KE: 80, CL: 78 } }
      },
      { 
        id: "102949", name: "Heng Visal", grade: "G9", section: "A", classCode: "9A", gender: "M", 
        comments: { Q1: "Visal is a diligent and respectful student." },
        scores: { Q1: { EL: 85, RE: 88, GR: 82, WR: 86, EM: 92, ES: 89, CA: 88, PE: 90, KE: 82, CL: 80 } }
      },
      { 
        id: "102950", name: "Meng Leakhena", grade: "G10", section: "A", classCode: "10A", gender: "F", 
        comments: { Q1: "Leakhena consistently scores top marks in all subjects." },
        scores: { Q1: { EL: 95, RE: 96, GR: 94, WR: 98, EM: 99, ES: 95, CA: 92, PE: 96, KE: 90, CL: 88 } }
      }
    ];

    let studentsData = [];
    let currentQuarter = 'Q1';
    let currentClassTab = '7A';

    function getStudentClassCode(s) {
      if (s.classCode) return s.classCode;
      let gNum = s.grade ? s.grade.replace('G', '') : '7';
      let sec = s.section ? s.section.replace('Section ', '').trim() : 'A';
      return gNum + sec;
    }

    // --- SYSTEM INITIALIZATION & LOGIN ---
    function initSystem() {
      // Restore Local Settings Backup
      const savedClasses = localStorage.getItem('joy_school_class_codes');
      if (savedClasses) {
        try { allClassCodes = sortClassCodes(JSON.parse(savedClasses)); } catch(e){}
      } else {
        allClassCodes = sortClassCodes(allClassCodes);
      }

      const savedTeachers = localStorage.getItem('joy_school_teachers_db');
      if (savedTeachers) {
        try { 
          teachersData = JSON.parse(savedTeachers);
          teachersData.forEach(t => { if (t.classes) t.classes = sortClassCodes(t.classes); });
        } catch(e){}
      }

      populateTeacherLoginDropdown();

      const savedRole = localStorage.getItem('joy_school_active_role');
      const savedTeacher = localStorage.getItem('joy_school_active_teacher');

      if (savedRole) {
        currentUserRole = savedRole;
        activeTeacherName = savedTeacher || "Teacher Account";
        applyUserPermissions();
        document.getElementById('login-modal').classList.add('hidden');
      } else {
        document.getElementById('login-modal').classList.remove('hidden');
      }

      const stored = localStorage.getItem('joy_school_students');
      if (stored) {
        try { studentsData = JSON.parse(stored); } catch(e) { studentsData = [...initialStudents]; }
      } else {
        studentsData = [...initialStudents];
        saveToLocalStorage();
      }

      try {
        if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
          firebase.initializeApp(firebaseConfig);
          db = firebase.firestore();

          // 1. Sync Students Collection
          db.collection("students").onSnapshot((snapshot) => {
            if (!snapshot.empty) {
              studentsData = snapshot.docs.map(doc => doc.data());
              saveToLocalStorage();
            } else {
              initialStudents.forEach(s => db.collection("students").doc(s.id).set(s));
            }
            updateSyncStatus(true, "Cloud Sync Active");
            renderStudentTable();
          }, () => updateSyncStatus(false, "Offline Local Mode"));

          // 2. Sync Teachers Accounts Real-time Across Devices
          db.collection("teachers").onSnapshot((snapshot) => {
            if (!snapshot.empty) {
              teachersData = snapshot.docs.map(doc => {
                const data = doc.data();
                if (data.classes) data.classes = sortClassCodes(data.classes);
                return data;
              });
              localStorage.setItem('joy_school_teachers_db', JSON.stringify(teachersData));
              populateTeacherLoginDropdown();
              applyUserPermissions();
              if (!document.getElementById('admin-modal').classList.contains('hidden')) {
                renderAdminTeachersTable();
              }
            } else {
              teachersData.forEach(t => db.collection("teachers").doc(t.name.replace(/\s+/g, '_')).set(t));
            }
          });

          // 3. Sync Class Codes Real-time Across Devices
          db.collection("system_settings").doc("class_codes").onSnapshot((doc) => {
            if (doc.exists && doc.data().codes) {
              allClassCodes = sortClassCodes(doc.data().codes);
              localStorage.setItem('joy_school_class_codes', JSON.stringify(allClassCodes));
              applyUserPermissions();
              if (!document.getElementById('admin-modal').classList.contains('hidden')) {
                renderAdminTeachersTable();
              }
            } else {
              db.collection("system_settings").doc("class_codes").set({ codes: allClassCodes });
            }
          });

        } else {
          updateSyncStatus(false, "Local Storage Mode");
        }
      } catch (err) {
        updateSyncStatus(false, "Offline Local Mode");
      }

      renderStudentTable();
    }

    function populateTeacherLoginDropdown() {
      const select = document.getElementById('login-teacher-select');
      select.innerHTML = '';
      teachersData.forEach(t => {
        const sortedClasses = sortClassCodes(t.classes || []);
        const opt = document.createElement('option');
        opt.value = t.name;
        opt.innerText = `${t.name} (Classes: ${sortedClasses.length > 0 ? sortedClasses.join(', ') : 'None'})`;
        select.appendChild(opt);
      });
    }

    function toggleAccountDropdowns(val) {
      const box = document.getElementById('teacher-select-box');
      if (val === 'admin') {
        box.classList.add('hidden');
      } else {
        box.classList.remove('hidden');
      }
    }

    function handleLogin(e) {
      e.preventDefault();
      const accountType = document.getElementById('login-account-type').value;
      const selectedTeacherName = document.getElementById('login-teacher-select').value;
      const passkey = document.getElementById('login-passkey').value.trim();
      const errorMsg = document.getElementById('login-error-msg');

      if (accountType === 'admin') {
        if (passkey !== "admin123") {
          errorMsg.innerText = "Invalid Admin Passkey. (Default: admin123)";
          errorMsg.classList.remove('hidden');
          return;
        }
        currentUserRole = 'admin';
        activeTeacherName = "Administrator";
      } else {
        const tObj = teachersData.find(t => t.name === selectedTeacherName);
        const correctPin = tObj ? tObj.passkey : "1234";
        if (passkey !== correctPin) {
          errorMsg.innerText = `Invalid Passkey for ${selectedTeacherName}.`;
          errorMsg.classList.remove('hidden');
          return;
        }
        currentUserRole = 'teacher';
        activeTeacherName = selectedTeacherName;
      }

      errorMsg.classList.add('hidden');
      localStorage.setItem('joy_school_active_role', currentUserRole);
      localStorage.setItem('joy_school_active_teacher', activeTeacherName);

      applyUserPermissions();
      document.getElementById('login-modal').classList.add('hidden');
    }

    function applyUserPermissions() {
      const badge = document.getElementById('user-role-badge');
      const avatarIcon = document.getElementById('user-avatar-icon');
      const adminBtn = document.getElementById('admin-panel-btn');

      allClassCodes = sortClassCodes(allClassCodes);

      if (currentUserRole === 'admin') {
        activeAllowedClasses = sortClassCodes([...allClassCodes]);
        badge.className = "text-xs font-bold px-2.5 py-0.5 rounded-full border mt-1 bg-purple-100 text-purple-800 border-purple-300";
        badge.innerHTML = `<i class="fa-solid fa-shield-halved text-[8px] mr-1"></i>Administrator`;
        avatarIcon.className = "fa-solid fa-user-shield text-7xl text-white mt-4";
        adminBtn.classList.remove('hidden');
      } else {
        const tObj = teachersData.find(t => t.name === activeTeacherName);
        activeAllowedClasses = (tObj && tObj.classes && tObj.classes.length > 0) ? sortClassCodes(tObj.classes) : (allClassCodes[0] ? [allClassCodes[0]] : ["7A"]);
        badge.className = "text-xs font-bold px-2.5 py-0.5 rounded-full border mt-1 bg-green-50 text-green-700 border-green-200";
        badge.innerHTML = `<i class="fa-solid fa-circle text-[8px] mr-1"></i>Active Educator`;
        avatarIcon.className = "fa-solid fa-user-tie text-7xl text-white mt-4";
        adminBtn.classList.add('hidden');
      }

      if (!activeAllowedClasses.includes(currentClassTab)) {
        currentClassTab = activeAllowedClasses[0] || '7A';
      }

      document.getElementById('teacher-name-display').innerText = activeTeacherName;
      
      const tagsContainer = document.getElementById('assigned-classes-tags');
      tagsContainer.innerHTML = activeAllowedClasses.map(c => `<span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Class ${c}</span>`).join('');

      populateClassSelectDropdowns();
      renderGradebookTabs();
      renderStudentTable();
    }

    function populateClassSelectDropdowns() {
      ['summary-class-select', 'rank-class-select', 'batch-class-select'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) {
          sel.innerHTML = activeAllowedClasses.map(c => `<option value="${c}">Class ${c}</option>`).join('');
          sel.value = currentClassTab;
        }
      });
    }

    function renderGradebookTabs() {
      const container = document.getElementById('gradebook-tabs-container');
      container.innerHTML = activeAllowedClasses.map(c => `
        <button onclick="switchClassTab('${c}')" id="tab-${c}" class="tab-btn px-4 py-2 rounded-md font-bold text-sm ${c === currentClassTab ? 'bg-[#2B72B8] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}">
          Class ${c}
        </button>
      `).join('');
    }

    function handleLogout() {
      if (confirm("Do you want to logout or switch to a different teacher account?")) {
        localStorage.removeItem('joy_school_active_role');
        localStorage.removeItem('joy_school_active_teacher');
        document.getElementById('login-passkey').value = '';
        populateTeacherLoginDropdown();
        document.getElementById('login-modal').classList.remove('hidden');
      }
    }

    function updateSyncStatus(online, text) {
      isCloudConnected = online;
      const dot = document.getElementById('sync-dot');
      const label = document.getElementById('sync-status-text');
      if (dot && label) {
        dot.className = online ? "w-3 h-3 rounded-full bg-green-500 animate-pulse" : "w-3 h-3 rounded-full bg-orange-500";
        label.innerText = text;
      }
    }

    function saveToLocalStorage() {
      localStorage.setItem('joy_school_students', JSON.stringify(studentsData));
    }

    function syncStudentToCloud(student) {
      saveToLocalStorage();
      if (db && isCloudConnected) {
        db.collection("students").doc(student.id).set(student).catch(err => console.error(err));
      }
    }

    function deleteStudentFromCloud(studentId) {
      saveToLocalStorage();
      if (db && isCloudConnected) {
        db.collection("students").doc(studentId).delete().catch(err => console.error(err));
      }
    }

    function syncTeachersToCloud(teacher) {
      localStorage.setItem('joy_school_teachers_db', JSON.stringify(teachersData));
      if (db && isCloudConnected && teacher) {
        db.collection("teachers").doc(teacher.name.replace(/\s+/g, '_')).set(teacher).catch(err => console.error(err));
      }
    }

    function syncClassCodesToCloud() {
      allClassCodes = sortClassCodes(allClassCodes);
      localStorage.setItem('joy_school_class_codes', JSON.stringify(allClassCodes));
      if (db && isCloudConnected) {
        db.collection("system_settings").doc("class_codes").set({ codes: allClassCodes }).catch(err => console.error(err));
      }
    }

    function calculateGWA(scoresObj) {
      if (!scoresObj) return 0;
      let total = 0, count = 0;
      subjectList.forEach(sub => {
        if (scoresObj[sub.code] !== undefined) {
          total += parseInt(scoresObj[sub.code]) || 0;
          count++;
        }
      });
      return count > 0 ? Math.round(total / count) : 0;
    }

    // --- ADMIN MANAGEMENT MODAL LOGIC ---
    function openAdminModal() {
      if (currentUserRole !== 'admin') return;
      renderAdminTeachersTable();
      document.getElementById('admin-modal').classList.remove('hidden');
    }

    function closeAdminModal() {
      document.getElementById('admin-modal').classList.add('hidden');
    }

    function renderAdminClassManagementList() {
      const container = document.getElementById('admin-class-tags-list');
      if (!container) return;
      container.innerHTML = allClassCodes.map(c => `
        <span class="inline-flex items-center space-x-1 bg-white border border-gray-300 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
          <span>Class ${c}</span>
          <button onclick="adminDeleteClass('${c}')" class="text-red-500 hover:text-red-700 ml-1.5 font-extrabold text-xs" title="Remove Class Section">&times;</button>
        </span>
      `).join('');
    }

    function adminAddClass() {
      let grade = document.getElementById('admin-new-class-grade').value.trim();
      let section = document.getElementById('admin-new-class-section').value.trim().toUpperCase();

      if (!grade || !section) {
        alert("Please enter both Grade (e.g. 12) and Section (e.g. A).");
        return;
      }

      grade = grade.toUpperCase().replace('GRADE', '').replace('G', '').trim();
      const code = grade + section;

      if (allClassCodes.includes(code)) {
        alert(`Class Section ${code} already exists in the system.`);
        return;
      }

      allClassCodes.push(code);
      allClassCodes = sortClassCodes(allClassCodes);
      syncClassCodesToCloud();

      document.getElementById('admin-new-class-grade').value = '';
      document.getElementById('admin-new-class-section').value = '';

      applyUserPermissions();
      renderAdminTeachersTable();
      alert(`Class ${code} created successfully!`);
    }

    function adminDeleteClass(code) {
      if (confirm(`Remove Class Section "${code}" from system?`)) {
        allClassCodes = allClassCodes.filter(c => c !== code);
        syncClassCodesToCloud();

        // Clean permissions from teachers
        teachersData.forEach(t => {
          if (t.classes) {
            t.classes = t.classes.filter(c => c !== code);
            syncTeachersToCloud(t);
          }
        });

        applyUserPermissions();
        renderAdminTeachersTable();
      }
    }

    function renderAdminTeachersTable() {
      const thead = document.getElementById('admin-teachers-thead');
      const tbody = document.getElementById('admin-teachers-tbody');

      allClassCodes = sortClassCodes(allClassCodes);

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-gray-800 text-white text-center">
            <th class="p-2.5 border text-left">Teacher Name</th>
            <th class="p-2.5 border">Passkey / PIN</th>
            ${allClassCodes.map(c => `<th class="p-2 border">${c}</th>`).join('')}
            <th class="p-2 border">Actions</th>
          </tr>
        `;
      }

      if (tbody) {
        tbody.innerHTML = '';
        teachersData.forEach((t, idx) => {
          if (!t.classes) t.classes = [];
          t.classes = sortClassCodes(t.classes);
          const tr = document.createElement('tr');
          tr.className = "border-b hover:bg-gray-50 text-center";
          tr.innerHTML = `
            <td class="p-2 border text-left font-bold text-gray-800">${t.name}</td>
            <td class="p-2 border">
              <input type="text" value="${t.passkey || '1234'}" onchange="updateTeacherPasskey(${idx}, this.value)" class="w-20 text-center border rounded px-1.5 py-1 font-mono text-xs font-bold text-purple-800 bg-purple-50 focus:ring-2 focus:ring-purple-600 outline-none">
            </td>
            ${allClassCodes.map(c => `
              <td class="p-2 border">
                <input type="checkbox" ${t.classes.includes(c) ? 'checked' : ''} onchange="toggleTeacherClassPermission(${idx}, '${c}', this.checked)" class="w-4 h-4 text-purple-600 rounded cursor-pointer">
              </td>
            `).join('')}
            <td class="p-2 border">
              <button onclick="adminDeleteTeacher(${idx})" class="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded" title="Delete Account">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      renderAdminClassManagementList();
    }

    function updateTeacherPasskey(teacherIdx, newPasskey) {
      const trimmed = newPasskey.trim();
      if (!trimmed) {
        alert("Passkey cannot be empty.");
        renderAdminTeachersTable();
        return;
      }
      teachersData[teacherIdx].passkey = trimmed;
      syncTeachersToCloud(teachersData[teacherIdx]);
      populateTeacherLoginDropdown();
    }

    function toggleTeacherClassPermission(teacherIdx, classCode, isChecked) {
      if (!teachersData[teacherIdx].classes) teachersData[teacherIdx].classes = [];
      if (isChecked) {
        if (!teachersData[teacherIdx].classes.includes(classCode)) teachersData[teacherIdx].classes.push(classCode);
      } else {
        teachersData[teacherIdx].classes = teachersData[teacherIdx].classes.filter(c => c !== classCode);
      }
      teachersData[teacherIdx].classes = sortClassCodes(teachersData[teacherIdx].classes);
      syncTeachersToCloud(teachersData[teacherIdx]);
      applyUserPermissions();
    }

    function adminAddTeacher() {
      const name = document.getElementById('admin-new-teacher-name').value.trim();
      const pin = document.getElementById('admin-new-teacher-pin').value.trim() || "1234";

      if (!name) { alert("Please enter a teacher name."); return; }

      const defaultClass = allClassCodes[0] || "7A";
      const newTeacher = { name: name, passkey: pin, classes: [defaultClass] };
      teachersData.push(newTeacher);
      
      syncTeachersToCloud(newTeacher);

      document.getElementById('admin-new-teacher-name').value = '';
      document.getElementById('admin-new-teacher-pin').value = '';

      renderAdminTeachersTable();
      populateTeacherLoginDropdown();
    }

    function adminDeleteTeacher(idx) {
      const teacherToDelete = teachersData[idx];
      if (confirm(`Remove teacher account "${teacherToDelete.name}"?`)) {
        teachersData.splice(idx, 1);
        localStorage.setItem('joy_school_teachers_db', JSON.stringify(teachersData));
        if (db && isCloudConnected && teacherToDelete) {
          db.collection("teachers").doc(teacherToDelete.name.replace(/\s+/g, '_')).delete().catch(err => console.error(err));
        }
        renderAdminTeachersTable();
        populateTeacherLoginDropdown();
      }
    }

    // --- MARKSHEET MODAL ---
    function openGradebook(quarter) {
      currentQuarter = quarter;
      document.getElementById('gradebook-title').innerText = `${getQuarterName(quarter)} Marks Entry`;
      renderGradebookTabs();
      document.getElementById('gradebook-modal').classList.remove('hidden');
      switchClassTab(currentClassTab);
    }

    function closeGradebook() {
      document.getElementById('gradebook-modal').classList.add('hidden');
    }

    function getQuarterName(code) {
      switch(code) {
        case 'Q1': return 'First Quarter';
        case 'Q2': return 'Second Quarter';
        case 'Q3': return 'Third Quarter';
        case 'Q4': return 'Fourth Quarter';
        default: return 'Quarter';
      }
    }

    function switchClassTab(classCode) {
      currentClassTab = classCode;
      renderGradebookTabs();
      renderStudentTable();
    }

    function renderStudentTable() {
      const tbody = document.getElementById('student-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      const filtered = studentsData.filter(s => getStudentClassCode(s) === currentClassTab);

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="15" class="text-center p-6 text-gray-500">No students found in Class ${currentClassTab}. Click "Add New Student" to add one.</td></tr>`;
        return;
      }

      filtered.forEach(student => {
        if (!student.scores) student.scores = {};
        if (!student.scores[currentQuarter]) student.scores[currentQuarter] = { EL: 0, RE: 0, GR: 0, WR: 0, EM: 0, ES: 0, CA: 0, PE: 0, KE: 0, CL: 0 };

        const qScores = student.scores[currentQuarter];
        const gwa = calculateGWA(qScores);
        const hasComment = (student.comments && student.comments[currentQuarter]) ? true : false;

        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50 text-center";
        tr.innerHTML = `
          <td class="p-2 border font-mono text-left font-bold text-gray-600">${student.id}</td>
          <td class="p-2 border text-left font-semibold text-gray-800">${student.name}</td>
          <td class="p-2 border font-bold">${student.gender}</td>
          ${subjectList.map(sub => `
            <td class="p-1 border">
              <input type="number" value="${qScores[sub.code] || 0}" onchange="updateScore('${student.id}', '${sub.code}', this.value)" class="w-11 text-center border rounded py-0.5 text-xs font-semibold">
            </td>
          `).join('')}
          <td class="p-2 border font-bold text-sm bg-blue-50 text-[#2B72B8]">${gwa}%</td>
          <td class="p-2 border space-x-1">
            <button onclick="openCommentModal('${student.id}')" class="px-2 py-1 rounded text-xs font-bold text-white transition ${hasComment ? 'bg-[#1EB354] hover:bg-[#189645]' : 'bg-gray-600 hover:bg-gray-700'}" title="Add/Edit Comment">
              <i class="fa-solid fa-comment-dots"></i>
            </button>
            <button onclick="deleteStudent('${student.id}')" class="bg-red-500 hover:bg-red-600 text-white text-xs p-1 px-2 rounded" title="Delete">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function updateScore(studentId, subCode, val) {
      const numVal = Math.min(100, Math.max(0, parseInt(val) || 0));
      const student = studentsData.find(s => s.id === studentId);
      if (student) {
        if (!student.scores) student.scores = {};
        if (!student.scores[currentQuarter]) student.scores[currentQuarter] = {};
        student.scores[currentQuarter][subCode] = numVal;
        syncStudentToCloud(student);
        renderStudentTable();
      }
    }

    function deleteStudent(studentId) {
      if (confirm(`Delete student record ${studentId}?`)) {
        studentsData = studentsData.filter(s => s.id !== studentId);
        deleteStudentFromCloud(studentId);
        renderStudentTable();
      }
    }

    // --- TEACHER COMMENTS LOGIC ---
    function openCommentModal(studentId) {
      currentCommentStudentId = studentId;
      const student = studentsData.find(s => s.id === studentId);
      if (!student) return;

      document.getElementById('comment-student-info').innerText = `${student.name} (ID: ${student.id})`;
      document.getElementById('comment-quarter-label').innerText = getQuarterName(currentQuarter);
      
      const existingComment = (student.comments && student.comments[currentQuarter]) ? student.comments[currentQuarter] : '';
      document.getElementById('comment-text-input').value = existingComment;

      document.getElementById('comment-modal').classList.remove('hidden');
    }

    function closeCommentModal() {
      document.getElementById('comment-modal').classList.add('hidden');
      currentCommentStudentId = null;
    }

    function saveStudentComment() {
      if (!currentCommentStudentId) return;
      const student = studentsData.find(s => s.id === currentCommentStudentId);
      if (student) {
        if (!student.comments) student.comments = {};
        const commentText = document.getElementById('comment-text-input').value.trim();
        student.comments[currentQuarter] = commentText;

        syncStudentToCloud(student);
        renderStudentTable();

        if (!document.getElementById('batch-reports-modal').classList.contains('hidden')) {
          renderBatchReports();
        }
      }
      closeCommentModal();
    }

    // --- FORM 1: CLASS SUMMARY MODAL ---
    function openClassSummaryModal() {
      populateClassSelectDropdowns();
      document.getElementById('summary-class-select').value = currentClassTab;
      document.getElementById('summary-quarter-select').value = currentQuarter;
      renderClassSummary();
      document.getElementById('class-summary-modal').classList.remove('hidden');
    }

    function switchSummaryClass(c) {
      currentClassTab = c;
      renderClassSummary();
    }

    function switchSummaryQuarter(q) {
      currentQuarter = q;
      renderClassSummary();
    }

    function renderClassSummary() {
      const filtered = studentsData.filter(s => getStudentClassCode(s) === currentClassTab);
      document.getElementById('summary-term-title').innerText = `SEMESTER ${currentQuarter === 'Q1' || currentQuarter === 'Q2' ? '1' : '2'} : ${getQuarterName(currentQuarter).toUpperCase()}`;
      document.getElementById('summary-class-display').innerText = `Class ${currentClassTab}`;
      document.getElementById('summary-teacher-display').innerText = activeTeacherName;

      const tbody = document.getElementById('summary-table-body');
      tbody.innerHTML = '';

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" class="p-6 text-center text-gray-500">No student records found in Class ${currentClassTab}.</td></tr>`;
        document.getElementById('summary-table-foot').innerHTML = '';
        return;
      }

      let totals = { EL:0, RE:0, GR:0, WR:0, EM:0, ES:0, CA:0, PE:0, KE:0, CL:0 };

      filtered.forEach(student => {
        const qScores = (student.scores && student.scores[currentQuarter]) ? student.scores[currentQuarter] : {};
        const gwa = calculateGWA(qScores);

        subjectList.forEach(sub => {
          totals[sub.code] += (qScores[sub.code] || 0);
        });

        const tr = document.createElement('tr');
        tr.className = "border-b";
        tr.innerHTML = `
          <td class="p-1.5 border text-left font-mono">${student.id}</td>
          <td class="p-1.5 border text-left font-semibold">${student.name}</td>
          <td class="p-1.5 border">${student.gender}</td>
          ${subjectList.map(sub => `<td class="p-1.5 border">${qScores[sub.code] || 0}</td>`).join('')}
          <td class="p-1.5 border font-bold bg-gray-100">${gwa}</td>
        `;
        tbody.appendChild(tr);
      });

      const count = filtered.length || 1;
      const foot = document.getElementById('summary-table-foot');
      foot.innerHTML = `
        <tr>
          <td colspan="3" class="p-1.5 border text-right font-bold text-red-600">Subject Averages:</td>
          ${subjectList.map(sub => `<td class="p-1.5 border">${Math.round(totals[sub.code] / count)}</td>`).join('')}
          <td class="p-1.5 border"></td>
        </tr>
      `;
    }

    function closeClassSummaryModal() {
      document.getElementById('class-summary-modal').classList.add('hidden');
    }

    // --- FORM 2: CLASS RANK MODAL ---
    function openClassRankModal() {
      populateClassSelectDropdowns();
      document.getElementById('rank-class-select').value = currentClassTab;
      document.getElementById('rank-quarter-select').value = currentQuarter;
      renderClassRank();
      document.getElementById('class-rank-modal').classList.remove('hidden');
    }

    function switchRankClass(c) {
      currentClassTab = c;
      renderClassRank();
    }

    function switchRankQuarter(q) {
      currentQuarter = q;
      renderClassRank();
    }

    function renderClassRank() {
      const filtered = studentsData.filter(s => getStudentClassCode(s) === currentClassTab);
      document.getElementById('rank-term-title').innerText = `SEMESTER ${currentQuarter === 'Q1' || currentQuarter === 'Q2' ? '1' : '2'} : ${getQuarterName(currentQuarter).toUpperCase()}`;
      document.getElementById('rank-class-display').innerText = `Class ${currentClassTab}`;

      const tbody = document.getElementById('rank-table-body');
      tbody.innerHTML = '';

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">No student records found in Class ${currentClassTab}.</td></tr>`;
        return;
      }

      const ranked = filtered.map(s => {
        const qScores = (s.scores && s.scores[currentQuarter]) ? s.scores[currentQuarter] : {};
        return { ...s, gwa: calculateGWA(qScores) };
      }).sort((a, b) => b.gwa - a.gwa);

      ranked.forEach((student, idx) => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
          <td class="p-2 border font-bold text-blue-700">${idx + 1}</td>
          <td class="p-2 border font-mono">${student.id}</td>
          <td class="p-2 border text-left font-semibold">${student.name}</td>
          <td class="p-2 border">${student.gender}</td>
          <td class="p-2 border font-bold text-base text-green-700">${student.gwa}%</td>
        `;
        tbody.appendChild(tr);
      });
    }

    function closeClassRankModal() {
      document.getElementById('class-rank-modal').classList.add('hidden');
    }

    // --- FORM 3: BATCH ALL INDIVIDUAL REPORTS (AUTOMATED SEM1 / SEM2 & GWA COMPUTATION) ---
    function openBatchIndividualReportsModal() {
      populateClassSelectDropdowns();
      document.getElementById('batch-class-select').value = currentClassTab;
      document.getElementById('batch-quarter-select').value = currentQuarter;
      renderBatchReports();
      document.getElementById('batch-reports-modal').classList.remove('hidden');
    }

    function switchBatchClass(c) {
      currentClassTab = c;
      renderBatchReports();
    }

    function switchBatchQuarter(q) {
      currentQuarter = q;
      renderBatchReports();
    }

    function renderBatchReports() {
      const filtered = studentsData.filter(s => getStudentClassCode(s) === currentClassTab);
      const container = document.getElementById('batch-reports-container');
      container.innerHTML = '';

      if (filtered.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-8">No student records found in Class ${currentClassTab}. Select another Class Section above or add students.</p>`;
        return;
      }

      filtered.forEach((student) => {
        const comment = (student.comments && student.comments[currentQuarter]) ? student.comments[currentQuarter] : 'No comments provided for this term.';

        // Calculate exact SEM1, SEM2, and final quarter score averages
        const calculatedSubjects = subjectList.map((sub) => {
          const q1 = (student.scores && student.scores['Q1'] && student.scores['Q1'][sub.code] !== undefined) ? Number(student.scores['Q1'][sub.code]) : null;
          const q2 = (student.scores && student.scores['Q2'] && student.scores['Q2'][sub.code] !== undefined) ? Number(student.scores['Q2'][sub.code]) : null;
          const q3 = (student.scores && student.scores['Q3'] && student.scores['Q3'][sub.code] !== undefined) ? Number(student.scores['Q3'][sub.code]) : null;
          const q4 = (student.scores && student.scores['Q4'] && student.scores['Q4'][sub.code] !== undefined) ? Number(student.scores['Q4'][sub.code]) : null;

          // SEM1 Calculation (Avg of Q1 & Q2)
          let sem1 = null;
          if (q1 !== null && q2 !== null) {
            sem1 = Math.round((q1 + q2) / 2);
          } else if (q1 !== null) {
            sem1 = q1;
          } else if (q2 !== null) {
            sem1 = q2;
          }

          // SEM2 Calculation (Avg of Q3 & Q4)
          let sem2 = null;
          if (q3 !== null && q4 !== null) {
            sem2 = Math.round((q3 + q4) / 2);
          } else if (q3 !== null) {
            sem2 = q3;
          } else if (q4 !== null) {
            sem2 = q4;
          }

          // Effective Subject AVG for selected term
          let finalAvg = null;
          if (currentQuarter === 'Q1') {
            finalAvg = q1;
          } else if (currentQuarter === 'Q2') {
            finalAvg = sem1 !== null ? sem1 : q2;
          } else if (currentQuarter === 'Q3') {
            if (sem1 !== null && q3 !== null) finalAvg = Math.round((sem1 + q3) / 2);
            else finalAvg = q3 !== null ? q3 : sem1;
          } else if (currentQuarter === 'Q4') {
            if (sem1 !== null && sem2 !== null) finalAvg = Math.round((sem1 + sem2) / 2);
            else finalAvg = sem2 !== null ? sem2 : sem1;
          }

          return {
            ...sub,
            q1: q1 !== null ? q1 : '--',
            q2: q2 !== null ? q2 : '--',
            sem1: sem1 !== null ? sem1 : '--',
            q3: q3 !== null ? q3 : '--',
            q4: q4 !== null ? q4 : '--',
            sem2: sem2 !== null ? sem2 : '--',
            finalAvg: finalAvg !== null ? finalAvg : '--'
          };
        });

        // Compute overall student GWA for current term
        const validAvgs = calculatedSubjects.filter(s => s.finalAvg !== '--').map(s => Number(s.finalAvg));
        const gwa = validAvgs.length > 0 ? Math.round(validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length) : 0;

        const card = document.createElement('div');
        card.className = "p-4 sm:p-6 border rounded-xl bg-white shadow-sm space-y-3 page-break";
        card.innerHTML = `
          <!-- JOY SCHOOL BANNER -->
          <div class="text-center border-b pb-2">
            <h2 class="text-xl font-bold text-red-700 font-serif">សាលាខ្មែរ-ចិន អេសប្រាយសិក្សា</h2>
            <h3 class="text-lg font-extrabold text-black">JOY SCHOOL</h3>
            <p class="text-[11px] text-gray-600 font-bold tracking-wider uppercase">STUDENT ACADEMIC REPORT</p>
          </div>

          <!-- STUDENT DETAILS -->
          <div class="grid grid-cols-2 text-xs font-semibold gap-1.5 bg-gray-50 p-2.5 rounded">
            <div>Student ID: <span class="font-mono font-bold">${student.id}</span></div>
            <div>Class: <span class="font-bold text-blue-700">${student.grade} - ${student.section ? 'Section ' + student.section : ''} (${getStudentClassCode(student)})</span></div>
            <div>Student Name: <span class="font-bold">${student.name}</span></div>
            <div>Class Teacher: <span class="font-bold text-blue-700">${activeTeacherName}</span></div>
          </div>

          <div class="bg-[#2B72B8] text-white text-center font-bold text-xs py-1 rounded uppercase">
            SEMESTER ${currentQuarter === 'Q1' || currentQuarter === 'Q2' ? '1' : '2'} | ${getQuarterName(currentQuarter).toUpperCase()}
          </div>

          <!-- SUBJECT MARKS TABLE -->
          <table class="w-full text-xs text-left border border-collapse">
            <thead>
              <tr class="bg-gray-100 font-bold border-b text-center">
                <th class="p-1.5 border text-left">#</th>
                <th class="p-1.5 border text-left">SUBJECTS</th>
                <th class="p-1.5 border">Q1</th>
                <th class="p-1.5 border">Q2</th>
                <th class="p-1.5 border bg-blue-100 text-blue-900">SEM1</th>
                <th class="p-1.5 border">Q3</th>
                <th class="p-1.5 border">Q4</th>
                <th class="p-1.5 border bg-orange-100 text-orange-900">SEM2</th>
                <th class="p-1.5 border bg-gray-200">AVG</th>
              </tr>
            </thead>
            <tbody>
              ${calculatedSubjects.map((sub, sIdx) => `
                <tr class="border-b text-center">
                  <td class="p-1 border font-bold">${sIdx + 1}</td>
                  <td class="p-1 border text-left">
                    <div class="font-bold text-[11px]">${sub.kh}</div>
                    <div class="text-gray-500 text-[10px]">${sub.en}</div>
                  </td>
                  <td class="p-1 border font-semibold">${sub.q1}</td>
                  <td class="p-1 border font-semibold">${sub.q2}</td>
                  <td class="p-1 border font-bold bg-blue-50/60 text-blue-900">${sub.sem1}</td>
                  <td class="p-1 border font-semibold">${sub.q3}</td>
                  <td class="p-1 border font-semibold">${sub.q4}</td>
                  <td class="p-1 border font-bold bg-orange-50/60 text-orange-900">${sub.sem2}</td>
                  <td class="p-1 border font-extrabold bg-gray-100">${sub.finalAvg}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- SUMMARY FOOTER -->
          <div class="grid grid-cols-2 text-xs border p-2.5 rounded bg-blue-50/50">
            <div>
              <span class="font-bold text-gray-600 block text-[11px]">Grade Point Average (G.P.A) / GWA:</span>
              <span class="text-xl font-extrabold text-[#2B72B8]">${gwa}%</span>
            </div>
            <div class="text-right">
              <span class="font-bold text-gray-600 block text-[11px]">Academic Standing:</span>
              <span class="px-2.5 py-1 rounded font-bold text-[11px] ${gwa >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                ${gwa >= 75 ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>

          <!-- TEACHER'S REMARKS BOX -->
          <div class="border p-2.5 rounded-lg bg-gray-50 text-xs">
            <span class="font-bold text-gray-700 block mb-0.5 text-[11px]">
              <i class="fa-solid fa-comment-dots text-[#2B72B8] mr-1"></i>Teacher's Remarks / Comments:
            </span>
            <p class="italic text-gray-800 pl-2 border-l-2 border-[#2B72B8] text-[11px]">${comment}</p>
          </div>

          <!-- SIGNATURE BLOCKS -->
          <div class="pt-3 grid grid-cols-2 gap-8 text-center text-xs text-gray-600">
            <div>
              <div class="border-b border-gray-400 w-36 mx-auto mb-1"></div>
              <p class="font-semibold text-[11px]">${activeTeacherName} (Class Adviser)</p>
            </div>
            <div>
              <div class="border-b border-gray-400 w-36 mx-auto mb-1"></div>
              <p class="font-semibold text-[11px]">School Principal / Admin</p>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function closeBatchIndividualReportsModal() {
      document.getElementById('batch-reports-modal').classList.add('hidden');
    }

    function filterStudents() {
      const query = document.getElementById('student-search').value.toLowerCase();
      const rows = document.querySelectorAll('#student-table-body tr');
      rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
      });
    }

    // --- ADD STUDENT LOGIC (SCOPED TO TEACHER PERMISSIONS) ---
    function openAddStudentModal() {
      document.getElementById('new-student-id').value = Math.floor(100000 + Math.random() * 900000);
      
      const classSelect = document.getElementById('new-student-class-select');
      classSelect.innerHTML = sortClassCodes(activeAllowedClasses).map(c => {
        const gradeNum = c.slice(0, -1);
        const sec = c.slice(-1);
        return `<option value="${c}">Grade ${gradeNum} - Section ${sec} (${c})</option>`;
      }).join('');

      document.getElementById('add-student-modal').classList.remove('hidden');
    }

    function closeAddStudentModal() {
      document.getElementById('add-student-modal').classList.add('hidden');
    }

    function handleSaveStudent(e) {
      e.preventDefault();
      const name = document.getElementById('new-student-name').value.trim();
      const id = document.getElementById('new-student-id').value.trim();
      const gender = document.getElementById('new-student-gender').value;
      const selectedClassCode = document.getElementById('new-student-class-select').value;

      if (!name || !selectedClassCode) return;

      const gNum = selectedClassCode.slice(0, -1);
      const sec = selectedClassCode.slice(-1);

      const newStudent = {
        id: id,
        name: name,
        grade: "G" + gNum,
        section: sec,
        classCode: selectedClassCode,
        gender: gender,
        comments: {},
        scores: {
          Q1: { EL: 80, RE: 80, GR: 80, WR: 80, EM: 80, ES: 80, CA: 80, PE: 80, KE: 80, CL: 80 }
        }
      };

      studentsData.push(newStudent);
      syncStudentToCloud(newStudent);

      const alertBox = document.getElementById('add-student-alert');
      alertBox.className = "p-3 rounded-lg text-xs font-semibold text-center bg-green-100 text-green-800 mb-2";
      alertBox.innerText = `Student "${name}" assigned to Class ${selectedClassCode} successfully!`;
      alertBox.classList.remove('hidden');

      setTimeout(() => {
        alertBox.classList.add('hidden');
        closeAddStudentModal();
        document.getElementById('add-student-form').reset();
        if (!document.getElementById('gradebook-modal').classList.contains('hidden')) {
          switchClassTab(selectedClassCode);
        }
      }, 1000);
    }

    // --- EXPORT & IMPORT JSON ---
    function exportData() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studentsData, null, 2));
      const anchor = document.createElement('a');
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", `joy_school_students_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }

    function importData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            studentsData = imported;
            studentsData.forEach(s => syncStudentToCloud(s));
            alert("Student records successfully imported and synchronized!");
            renderStudentTable();
          } else {
            alert("Invalid data file format.");
          }
        } catch (err) {
          alert("Error reading file: " + err.message);
        }
      };
      reader.readAsText(file);
    }

    window.onload = function() {
      initSystem();
    };
