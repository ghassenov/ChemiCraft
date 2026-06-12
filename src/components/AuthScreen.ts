import { gameStore } from '../store/gameStore';

export function renderAuthScreen(onComplete: () => void) {
  const overlay = document.getElementById('auth-overlay')!;

  overlay.innerHTML = `
    <div class="auth-float-deco" style="top:8%;left:6%;font-size:22px;animation-delay:-1s;">⚗️</div>
    <div class="auth-float-deco" style="bottom:10%;right:5%;font-size:18px;animation-delay:-3s;">🔬</div>
    <div class="auth-float-deco" style="top:25%;right:8%;font-size:14px;animation-delay:-7s;">🧪</div>
    <div class="auth-float-deco" style="bottom:30%;left:5%;font-size:16px;animation-delay:-11s;">⚛️</div>
    <div class="auth-float-deco" style="top:45%;left:3%;font-size:12px;animation-delay:-5s;">💎</div>
    <div class="auth-float-deco" style="top:15%;right:4%;font-size:20px;animation-delay:-9s;">🌡️</div>

    <div class="auth-card">
      <div class="auth-molecule">⚗️</div>
      <h1>CHEMICRAFT</h1>
      <p class="subtitle">Learn Chemistry Through Adventure</p>

      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login" id="tab-login">Login</button>
        <button class="auth-tab" data-tab="signup" id="tab-signup">Sign Up</button>
      </div>

      <form id="login-form">
        <div class="form-group">
          <label for="login-username">Username</label>
          <input type="text" id="login-username" placeholder="Enter your username" autocomplete="username" required />
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" placeholder="Enter your password" autocomplete="current-password" required />
        </div>
        <div class="error-msg" id="login-error"></div>
        <button type="submit" class="btn-primary">Enter the Lab →</button>
      </form>

      <form id="signup-form" style="display: none;">
        <div class="form-group">
          <label for="signup-username">Username</label>
          <input type="text" id="signup-username" placeholder="Choose a username" autocomplete="username" required minlength="3" />
        </div>
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input type="email" id="signup-email" placeholder="your@email.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label for="signup-password">Password</label>
          <input type="password" id="signup-password" placeholder="Choose a password" autocomplete="new-password" required minlength="6" />
        </div>
        <div class="error-msg" id="signup-error"></div>
        <button type="submit" class="btn-primary">Create Account →</button>
      </form>

      <div class="divider">or</div>

      <button class="btn-guest" id="btn-guest">
        ⚡ Play as Guest (progress won't be saved)
      </button>
    </div>
  `;

  const loginTab = overlay.querySelector('#tab-login')!;
  const signupTab = overlay.querySelector('#tab-signup')!;
  const loginForm = overlay.querySelector('#login-form') as HTMLFormElement;
  const signupForm = overlay.querySelector('#signup-form') as HTMLFormElement;

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = (overlay.querySelector('#login-username') as HTMLInputElement).value.trim();
    const password = (overlay.querySelector('#login-password') as HTMLInputElement).value;

    if (!username || !password) {
      showError('login-error', 'Please fill in all fields.');
      return;
    }

    gameStore.login(username);
    hideOverlay(overlay, onComplete);
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = (overlay.querySelector('#signup-username') as HTMLInputElement).value.trim();
    const email = (overlay.querySelector('#signup-email') as HTMLInputElement).value.trim();
    const password = (overlay.querySelector('#signup-password') as HTMLInputElement).value;

    if (!username || !email || !password) {
      showError('signup-error', 'Please fill in all fields.');
      return;
    }
    if (username.length < 3) {
      showError('signup-error', 'Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      showError('signup-error', 'Password must be at least 6 characters.');
      return;
    }

    gameStore.login(username);
    hideOverlay(overlay, onComplete);
  });

  overlay.querySelector('#btn-guest')!.addEventListener('click', () => {
    gameStore.playAsGuest();
    hideOverlay(overlay, onComplete);
  });
}

function showError(id: string, message: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function hideOverlay(overlay: HTMLElement, callback: () => void) {
  overlay.style.transition = 'opacity 0.4s ease';
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.style.opacity = '1';
    callback();
  }, 400);
}
