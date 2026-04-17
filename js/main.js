/* ========================================
   main.js – 会社設立サポートLP
   ・スクロールアニメーション（reveal）
   ・ヘッダーの背景変化
   ・ハンバーガーメニュー
   ・FAQアコーディオン
   ・フォームバリデーション & 送信処理
   ・追従型CTAボタン（floating CTA）
======================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ======================================
     1. SCROLL REVEAL ANIMATION
  ====================================== */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // 複数要素が一度に表示されるときに少しずつ遅延させる
          const delay = (idx % 6) * 80;
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));


  /* ======================================
     2. HEADER – スクロール検知 & 背景変化
  ====================================== */
  const header = document.getElementById('header');

  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初期状態

  /* ======================================
     3. HAMBURGER MENU (スマホ)
  ====================================== */
  const hamburger  = document.getElementById('hamburger');
  const headerNav  = document.getElementById('headerNav');

  if (hamburger && headerNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = headerNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      // ボディスクロールを止める
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // ナビリンクをクリックでメニューを閉じる
    headerNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        headerNav.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ======================================
     4. SMOOTH SCROLL (ページ内アンカー)
  ====================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

  /* ======================================
     5. FAQ ACCORDION
  ====================================== */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach((item) => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));

      // 他のFAQを閉じる（アコーディオン動作）
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq__question')?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  /* ======================================
     6. FLOATING CTA BUTTON
  ====================================== */
  const floatingCta = document.getElementById('floatingCta');
  const heroSection  = document.getElementById('hero');
  const contactSection = document.getElementById('contact');

  if (floatingCta && heroSection) {
    const floatingObserver = new IntersectionObserver(
      ([entry]) => {
        // ヒーローが見えているときは非表示
        if (entry.isIntersecting) {
          floatingCta.classList.remove('is-visible');
        } else {
          // コンタクトセクションに到達したら非表示
          if (contactSection) {
            const contactRect = contactSection.getBoundingClientRect();
            if (contactRect.top <= window.innerHeight * 0.5) {
              floatingCta.classList.remove('is-visible');
              return;
            }
          }
          floatingCta.classList.add('is-visible');
        }
      },
      { threshold: 0 }
    );
    floatingObserver.observe(heroSection);

    // コンタクトセクション到達時に非表示
    if (contactSection) {
      const contactObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            floatingCta.classList.remove('is-visible');
          } else {
            const heroRect = heroSection.getBoundingClientRect();
            if (heroRect.bottom < 0) {
              floatingCta.classList.add('is-visible');
            }
          }
        },
        { threshold: 0.3 }
      );
      contactObserver.observe(contactSection);
    }
  }

  /* ======================================
     7. FORM VALIDATION & SUBMIT
  ====================================== */
  const form       = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    const nameInput    = document.getElementById('name');
    const emailInput   = document.getElementById('email');
    const privacyCheck = document.getElementById('privacy');

    const nameError    = document.getElementById('nameError');
    const emailError   = document.getElementById('emailError');
    const reasonError  = document.getElementById('reasonError');
    const privacyError = document.getElementById('privacyError');

    // エラー表示ヘルパー
    const showError = (el, input, msg) => {
      el.textContent = msg;
      input?.classList.add('has-error');
    };
    const clearError = (el, input) => {
      el.textContent = '';
      input?.classList.remove('has-error');
    };

    // リアルタイムバリデーション
    nameInput?.addEventListener('input', () => {
      if (nameInput.value.trim()) clearError(nameError, nameInput);
    });
    emailInput?.addEventListener('input', () => {
      if (isValidEmail(emailInput.value)) clearError(emailError, emailInput);
    });

    // メールアドレス正規表現チェック
    const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    // フォーム送信
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // 名前チェック
      if (!nameInput.value.trim()) {
        showError(nameError, nameInput, 'お名前を入力してください');
        isValid = false;
      } else {
        clearError(nameError, nameInput);
      }

      // メールチェック
      if (!emailInput.value.trim()) {
        showError(emailError, emailInput, 'メールアドレスを入力してください');
        isValid = false;
      } else if (!isValidEmail(emailInput.value)) {
        showError(emailError, emailInput, '正しいメールアドレスを入力してください');
        isValid = false;
      } else {
        clearError(emailError, emailInput);
      }

      // ご相談のきっかけ（ラジオ）チェック
      const reasonChecked = form.querySelector('input[name="reason"]:checked');
      if (!reasonChecked) {
        showError(reasonError, null, 'ご相談のきっかけをお選びください');
        isValid = false;
      } else {
        clearError(reasonError, null);
      }

      // プライバシーチェック
      if (!privacyCheck.checked) {
        showError(privacyError, null, 'プライバシーポリシーへの同意が必要です');
        isValid = false;
      } else {
        clearError(privacyError, null);
      }

      if (!isValid) {
        // 最初のエラー要素にスクロール
        const firstError = form.querySelector('.has-error, .form__error:not(:empty)');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // 送信処理（デモ：ローディング → 成功表示）
      simulateSubmit();
    });

    const simulateSubmit = () => {
      const submitBtn = document.getElementById('submitBtn');

      // ローディング状態
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        送信中…
      `;

      // スピンアニメーション追加
      const spinStyle = document.createElement('style');
      spinStyle.textContent = `.spin { animation: spin 0.9s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(spinStyle);

      setTimeout(() => {
        // 成功表示
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
          formSuccess.style.animation = 'fadeInUp 0.6s ease both';
          const successStyle = document.createElement('style');
          successStyle.textContent = `@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
          document.head.appendChild(successStyle);
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1800);
    };
  }

  /* ======================================
     8. REVEAL – 最初から見えている要素を即表示
  ====================================== */
  // ページ読み込み直後にビューポート内に入っている要素を即時表示
  setTimeout(() => {
    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('is-visible');
      }
    });
  }, 100);

});
