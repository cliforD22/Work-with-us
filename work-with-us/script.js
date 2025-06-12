// Registration (with profile picture)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('regPhoto');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please upload a profile picture');
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const userData = {
        fullName: document.getElementById('regFullName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        idNumber: document.getElementById('regID').value,
        school: document.getElementById('regSchool').value,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        profilePic: reader.result
      };

      localStorage.setItem(userData.username, JSON.stringify(userData));
      alert('Registration successful. Please log in.');
      window.location.href = 'index.html';
    };

    reader.readAsDataURL(file);
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'Admin Tutor' && password === '71414') {
      window.location.href = 'admin.html';
    } else {
      const storedData = JSON.parse(localStorage.getItem(username));
      if (storedData && storedData.password === password) {
        sessionStorage.setItem('studentUser', username);
        window.location.href = 'student.html';
      } else {
        alert('Invalid credentials');
      }
    }
  });
}

// Logout
function logout() {
  sessionStorage.removeItem('studentUser');
  window.location.href = 'index.html';
}

// Load student details
function loadStudentDetails() {
  const username = sessionStorage.getItem('studentUser');
  if (!username) return;

  const userData = JSON.parse(localStorage.getItem(username));
  if (!userData) return;

  const studentName = document.getElementById('studentName');
  const studentDetails = document.getElementById('studentDetails');
  const profilePic = document.getElementById('studentProfilePic');

  if (studentName) studentName.textContent = `Welcome back, ${userData.fullName}`;
  if (studentDetails) studentDetails.textContent = `School: ${userData.school} | Email: ${userData.email}`;
  if (profilePic && userData.profilePic) profilePic.src = userData.profilePic;
}

// Update student profile picture
function updateProfilePicture() {
  const fileInput = document.getElementById('updatePic');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an image');
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const username = sessionStorage.getItem('studentUser');
    const userData = JSON.parse(localStorage.getItem(username));

    userData.profilePic = reader.result;
    localStorage.setItem(username, JSON.stringify(userData));

    alert('Profile picture updated!');
    loadStudentDetails();
  };

  reader.readAsDataURL(file);
}

// Submit student comment
function submitComment() {
  const comment = document.getElementById('studentComment').value;
  if (!comment) return alert("Please write something before submitting.");

  let comments = JSON.parse(localStorage.getItem('comments') || '[]');
  comments.push({ text: comment, reply: "" });
  localStorage.setItem('comments', JSON.stringify(comments));
  alert("Comment submitted.");
  document.getElementById('studentComment').value = '';
}

// Load admin comments
function loadCommentsForAdmin() {
  const section = document.getElementById('commentsSection');
  if (!section) return;

  let comments = JSON.parse(localStorage.getItem('comments') || '[]');
  section.innerHTML = comments.map((c, index) => `
    <div style="margin-bottom:20px;">
      <p><strong>Comment ${index + 1}:</strong> ${c.text}</p>
      <p><strong>Reply:</strong> ${c.reply || 'No reply yet'}</p>
      <textarea id="reply${index}" rows="2" cols="50" placeholder="Write a reply...">${c.reply || ''}</textarea><br>
      <button onclick="submitReply(${index})">Submit Reply</button>
      <hr>
    </div>
  `).join('');
}

function submitReply(index) {
  let comments = JSON.parse(localStorage.getItem('comments') || '[]');
  const replyText = document.getElementById(`reply${index}`).value;
  comments[index].reply = replyText;
  localStorage.setItem('comments', JSON.stringify(comments));
  alert('Reply submitted');
  loadCommentsForAdmin();
}

// Admin tutorial upload
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
  uploadForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const subject = document.getElementById('uploadSubject').value;
    const fileInput = document.getElementById('tutorialFile');
    const file = fileInput.files[0];

    if (!file) return alert("Please select a file");

    const reader = new FileReader();
    reader.onload = function () {
      let tutorials = JSON.parse(localStorage.getItem('tutorials') || '{}');
      if (!tutorials[subject]) tutorials[subject] = [];
      tutorials[subject].push({ name: file.name, data: reader.result });

      localStorage.setItem('tutorials', JSON.stringify(tutorials));
      alert("File uploaded!");
      fileInput.value = '';
      loadUploadedList();
    };

    reader.readAsDataURL(file);
  });
}

// Load uploaded tutorials
function loadUploadedList() {
  const listDiv = document.getElementById('uploadedList');
  if (!listDiv) return;

  let tutorials = JSON.parse(localStorage.getItem('tutorials') || '{}');
  let html = '';

  for (const subject in tutorials) {
    html += `<h4>${subject.toUpperCase()}</h4><ul>`;
    tutorials[subject].forEach((file, index) => {
      html += `
        <li>
          <a href="${file.data}" target="_blank" id="fileLink-${subject}-${index}">${file.name}</a>
          <input type="text" id="editInput-${subject}-${index}" value="${file.name}" style="display:none; width:200px;">
          <button onclick="toggleEdit('${subject}', ${index})" id="editBtn-${subject}-${index}">Edit</button>
          <button onclick="saveRename('${subject}', ${index})" id="saveBtn-${subject}-${index}" style="display:none;">Save</button>
          <button onclick="deleteTutorial('${subject}', ${index})">Delete</button>
        </li>`;
    });
    html += `</ul>`;
  }

  listDiv.innerHTML = html;
}

function toggleEdit(subject, index) {
  document.getElementById(`fileLink-${subject}-${index}`).style.display = 'none';
  document.getElementById(`editInput-${subject}-${index}`).style.display = 'inline-block';
  document.getElementById(`editBtn-${subject}-${index}`).style.display = 'none';
  document.getElementById(`saveBtn-${subject}-${index}`).style.display = 'inline-block';
}

function saveRename(subject, index) {
  const newName = document.getElementById(`editInput-${subject}-${index}`).value;
  let tutorials = JSON.parse(localStorage.getItem('tutorials') || '{}');
  if (tutorials[subject] && tutorials[subject][index]) {
    tutorials[subject][index].name = newName;
    localStorage.setItem('tutorials', JSON.stringify(tutorials));
    loadUploadedList();
  }
}

function deleteTutorial(subject, index) {
  let tutorials = JSON.parse(localStorage.getItem('tutorials') || '{}');
  tutorials[subject].splice(index, 1);
  if (tutorials[subject].length === 0) delete tutorials[subject];
  localStorage.setItem('tutorials', JSON.stringify(tutorials));
  loadUploadedList();
}

// Load tutorial for student
function loadTutorial(subject) {
  const tutorialContent = document.getElementById('tutorialContent');
  let tutorials = JSON.parse(localStorage.getItem('tutorials') || '{}');
  let files = tutorials[subject] || [];

  let content = `<h3>${subject.charAt(0).toUpperCase() + subject.slice(1)} Tutorial</h3>`;
  if (files.length > 0) {
    content += '<ul>';
    files.forEach(file => {
      content += `<li><a href="${file.data}" target="_blank">${file.name}</a></li>`;
    });
    content += '</ul>';
  } else {
    content += '<p>No tutorial files uploaded yet.</p>';
  }

  tutorialContent.innerHTML = content;
}

// Load student list with profile pictures
function loadStudentList() {
  const listDiv = document.getElementById('studentList');
  if (!listDiv) return;

  let studentsHTML = '';
  for (let key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) continue;
    const data = JSON.parse(localStorage.getItem(key));
    if (data && data.school && data.fullName && data.email && data.phone && data.idNumber) {
      studentsHTML += `
        <div style="margin-bottom: 15px;">
          ${data.profilePic ? `<img src="${data.profilePic}" style="width:60px; height:60px; border-radius:50%;"><br>` : ''}
          <strong>${data.fullName}</strong><br>
          School: ${data.school}<br>
          Email: ${data.email}<br>
          Phone: ${data.phone}<br>
          ID: ${data.idNumber}<br>
          <button onclick="editStudent('${key}')">Edit</button>
          <button onclick="deleteStudent('${key}')">Delete</button>
          <hr>
        </div>`;
    }
  }
  listDiv.innerHTML = studentsHTML;
}

function editStudent(username) {
  const data = JSON.parse(localStorage.getItem(username));
  if (!data) return;

  const fullName = prompt("Edit Full Name", data.fullName);
  const email = prompt("Edit Email", data.email);
  const phone = prompt("Edit Phone", data.phone);
  const idNumber = prompt("Edit ID Number", data.idNumber);
  const school = prompt("Edit School", data.school);

  if (fullName && email && phone && idNumber && school) {
    const updatedData = { ...data, fullName, email, phone, idNumber, school };
    localStorage.setItem(username, JSON.stringify(updatedData));
    loadStudentList();
  }
}

function deleteStudent(username) {
  if (confirm("Are you sure you want to delete this student?")) {
    localStorage.removeItem(username);
    loadStudentList();
  }
}

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

function applyStoredMode() {
  const mode = localStorage.getItem('darkMode');
  if (mode === 'enabled') {
    document.body.classList.add('dark-mode');
  }
}

// Init
window.onload = function () {
  applyStoredMode();
  loadStudentDetails();
  loadUploadedList();
  loadCommentsForAdmin();
  loadStudentList();
};
