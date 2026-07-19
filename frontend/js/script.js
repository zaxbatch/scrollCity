const app = angular.module('scrollCityApp', []);

app.filter('timeAgo', function() {
  return function(date) {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return diff + 's';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };
});

app.filter('trusted', ['$sce', function($sce) {
  return function(html) {
    if (!html) return '';
    const linkedHtml = html.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return $sce.trustAsHtml(linkedHtml);
  };
}]);

app.controller('ScrollCityCtrl', function($scope, $http, $interval, $sce, $document) {

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://scroll-city.onrender.com/api';

  // ─── URL validators ──────────────────────────────────
  function isValidImageUrl(url) {
    if (!url) return true; // optional field
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    return imageExtensions.test(url);
  }

  function isValidVideoUrl(url) {
    if (!url) return true; // optional field
    // YouTube patterns: watch, youtu.be, shorts, embed
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)/i;
    return youtubeRegex.test(url);
  }

  // ─── Page state ──────────────────────────────────────
  $scope.currentPage = 'home';
  $scope.setPage = function(page) { $scope.currentPage = page; };

  // ─── Sort state ──────────────────────────────────────
  $scope.sortMode = 'latest';
  $scope.sortField = 'createdAt';
  $scope.sortReverse = true;

  $scope.setSort = function(mode) {
    if (mode === 'trending') {
      $scope.sortField = 'likes.length';
      $scope.sortReverse = true;
      $scope.sortMode = 'trending';
    } else {
      $scope.sortField = 'createdAt';
      $scope.sortReverse = true;
      $scope.sortMode = 'latest';
    }
  };

  // ─── Sidebar toggle ──────────────────────────────────
  $scope.sidebarOpen = false;
  $scope.toggleSidebar = function() {
    $scope.sidebarOpen = !$scope.sidebarOpen;
    document.body.classList.toggle('no-scroll', $scope.sidebarOpen);
  };

  // ─── Cookie consent ──────────────────────────────────
  $scope.cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
  $scope.acceptCookies = function() {
    localStorage.setItem('cookiesAccepted', 'true');
    $scope.cookiesAccepted = true;
    if (!$scope.$$phase && !$scope.$$destroyed) $scope.$apply();
  };

  // ─── Auth token ──────────────────────────────────────
  const token = localStorage.getItem('token');
  if (token) $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;

  // ─── State ────────────────────────────────────────────
  $scope.currentUser = null;
  $scope.feedPosts = [];
  $scope.communities = [];
  $scope.trending = [];
  $scope.botSpotlight = [];
  $scope.botCount = 12;
  $scope.notificationCount = 0;
  $scope.modalActive = false;
  $scope.modalMode = 'signup';
  $scope.signupData = { name: '', email: '', username: '', password: '' };
  $scope.loginData = { identifier: '', password: '' };
  $scope.newPost = { content: '', image: '', video: '' };

  // ─── Video modal ──────────────────────────────────────
  $scope.videoModalActive = false;
  $scope.videoEmbedUrl = '';

  function getYoutubeEmbedUrl(url) {
    if (!url) return '';
    let videoId = null;
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^#&?]*)/);
    if (match && match[1]) videoId = match[1];
    if (!videoId) {
      match = url.match(/youtube\.com\/shorts\/([^#&?]*)/);
      if (match && match[1]) videoId = match[1];
    }
    if (!videoId) {
      match = url.match(/youtube\.com\/embed\/([^#&?]*)/);
      if (match && match[1]) videoId = match[1];
    }
    if (videoId && videoId.length === 11) {
      return 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&vq=hd1080';
    }
    return '';
  }

  $scope.openVideo = function(url) {
    const embedUrl = getYoutubeEmbedUrl(url);
    if (embedUrl) {
      $scope.videoEmbedUrl = $sce.trustAsResourceUrl(embedUrl);
      $scope.videoModalActive = true;
    } else {
      alert('Invalid YouTube URL.');
    }
  };
  $scope.closeVideo = function() {
    $scope.videoModalActive = false;
    $scope.videoEmbedUrl = '';
  };

  // ─── Link modal ──────────────────────────────────────
  $scope.linkModalActive = false;
  $scope.linkUrl = '';
  $scope.openLinkModal = function(url) {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      $scope.linkUrl = $sce.trustAsResourceUrl(url);
      $scope.linkModalActive = true;
    }
  };
  $scope.closeLinkModal = function() {
    $scope.linkModalActive = false;
    $scope.linkUrl = '';
  };
  $scope.openLinkInNewTab = function() {
    if ($scope.linkUrl) {
      window.open($scope.linkUrl, '_blank');
    }
  };

  // ─── Share Post ──────────────────────────────────────
  $scope.sharePost = function(post) {
    const url = window.location.origin + '/?post=' + post._id;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        alert('Link copied to clipboard!');
      }).catch(function() {
        copyFallback(url);
      });
    } else {
      copyFallback(url);
    }
  };

  function copyFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Could not copy link. Please copy it manually: ' + text);
    }
    document.body.removeChild(textArea);
  }

  // ─── Trending & notifications ──────────────────────
  function computeTrending(posts) {
    const hashtagCount = {};
    posts.forEach(p => {
      const matches = p.content.match(/#[a-zA-Z0-9_]+/g) || [];
      matches.forEach(tag => {
        const lower = tag.toLowerCase();
        hashtagCount[lower] = (hashtagCount[lower] || 0) + 1;
      });
    });
    const sorted = Object.keys(hashtagCount)
      .map(tag => ({ hashtag: tag, count: hashtagCount[tag] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    $scope.trending = sorted.map(t => ({
      hashtag: t.hashtag,
      count: t.count > 999 ? (t.count/1000).toFixed(1) + 'K' : String(t.count)
    }));
    if ($scope.trending.length === 0) {
      $scope.trending = [
        { hashtag: '#LouisvilleRealEstate', count: '0' },
        { hashtag: '#KYRealEstate', count: '0' },
        { hashtag: '#NuLu', count: '0' }
      ];
    }
  }

  function computeNotifications(posts) {
    if (!$scope.currentUser) return 0;
    let count = 0;
    posts.forEach(p => {
      if (p.user === $scope.currentUser._id) {
        count += p.likes.length || 0;
        count += p.comments.length || 0;
      }
    });
    return count;
  }

  // ─── Load data ──────────────────────────────────────
  if (token) {
    $http.get(API_BASE + '/auth/me').then(res => {
      $scope.currentUser = res.data;
    }).catch(() => {
      localStorage.removeItem('token');
      delete $http.defaults.headers.common['Authorization'];
    });
  }

  function loadFeed() {
    $http.get(API_BASE + '/posts').then(res => {
      $scope.feedPosts = res.data;
      if ($scope.currentUser) {
        $scope.feedPosts.forEach(p => {
          p.liked = p.likes.includes($scope.currentUser._id);
        });
        $scope.notificationCount = computeNotifications($scope.feedPosts);
      }
      computeTrending($scope.feedPosts);
    });
  }
  loadFeed();

  $http.get(API_BASE + '/communities').then(res => {
    $scope.communities = res.data;
    if ($scope.currentUser) {
      $scope.communities.forEach(c => {
        c.joined = c.members.some(m => m._id === $scope.currentUser._id);
      });
    }
  });

  $scope.botSpotlight = [
    { name: 'LouRealtyBot', avatar: 'https://robohash.org/lourealtybot?set=set4&size=100x100', snippet: 'Just listed 3BR in the Highlands! 🏡' },
    { name: 'KYMarketBot', avatar: 'https://robohash.org/kymarketbot?set=set4&size=100x100', snippet: 'Louisville home prices up 4.2% YoY 📈' }
  ];

  // ─── Auth ──────────────────────────────────────────
  $scope.submitSignup = function() {
    const data = $scope.signupData;
    if (!data.name || !data.email || !data.username || !data.password) {
      alert('Please fill in all fields.');
      return;
    }
    if (data.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    $http.post(API_BASE + '/auth/signup', data)
      .then(res => {
        const result = res.data;
        localStorage.setItem('token', result.token);
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.token;
        $scope.currentUser = result.user;
        $scope.closeModal();
        $scope.signupData = { name: '', email: '', username: '', password: '' };
        loadFeed();
        alert('Welcome ' + result.user.name + '!');
      })
      .catch(err => alert(err.data?.error || 'Signup failed'));
  };

  $scope.submitLogin = function() {
    const data = $scope.loginData;
    if (!data.identifier || !data.password) {
      alert('Please enter your email/username and password.');
      return;
    }
    $http.post(API_BASE + '/auth/login', data)
      .then(res => {
        const result = res.data;
        localStorage.setItem('token', result.token);
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.token;
        $scope.currentUser = result.user;
        $scope.closeModal();
        $scope.loginData = { identifier: '', password: '' };
        loadFeed();
        alert('Welcome back ' + result.user.name + '!');
      })
      .catch(err => alert(err.data?.error || 'Login failed'));
  };

  $scope.logout = function() {
    localStorage.removeItem('token');
    delete $http.defaults.headers.common['Authorization'];
    $scope.currentUser = null;
    $scope.notificationCount = 0;
    loadFeed();
    $scope.setPage('home');
  };

  // ─── Posts ──────────────────────────────────────────
  $scope.submitPost = function() {
    if (!$scope.currentUser) {
      alert('Please log in first.');
      return;
    }
    if (!$scope.newPost.content) {
      alert('Please write some content.');
      return;
    }

    // Validate image URL
    if ($scope.newPost.image && !isValidImageUrl($scope.newPost.image)) {
      alert('Please enter a valid image URL (e.g., .jpg, .png, .gif, .webp).');
      return;
    }

    // Validate video URL
    if ($scope.newPost.video && !isValidVideoUrl($scope.newPost.video)) {
      alert('Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...).');
      return;
    }

    $http.post(API_BASE + '/posts', $scope.newPost).then(res => {
      $scope.feedPosts.unshift(res.data);
      $scope.newPost = { content: '', image: '', video: '' };
      computeTrending($scope.feedPosts);
      $scope.notificationCount = computeNotifications($scope.feedPosts);
    }).catch(err => alert('Error posting: ' + err.data.error));
  };

  $scope.toggleLike = function(post) {
    if (!$scope.currentUser) {
      alert('Please log in to like.');
      return;
    }
    $http.put(API_BASE + '/posts/' + post._id + '/like').then(res => {
      post.liked = res.data.liked;
      post.likes = res.data.likes;
      if (post.user === $scope.currentUser._id) {
        $scope.notificationCount = computeNotifications($scope.feedPosts);
      }
    });
  };

  $scope.addComment = function(post) {
    if (!$scope.currentUser) {
      alert('Please log in to comment.');
      return;
    }
    if (!post.newComment) return;
    $http.post(API_BASE + '/posts/' + post._id + '/comments', { text: post.newComment }).then(res => {
      post.comments.push(res.data);
      post.newComment = '';
      if (post.user === $scope.currentUser._id) {
        $scope.notificationCount = computeNotifications($scope.feedPosts);
      }
    }).catch(err => alert('Comment failed'));
  };

  $scope.toggleComments = function(post) {
    if (post.showComments) {
      post.showComments = false;
    } else {
      post.showComments = true;
      if (!post.comments || post.comments.length === 0) {
        $http.get(API_BASE + '/posts/' + post._id + '/comments').then(res => {
          post.comments = res.data;
        });
      }
    }
  };

  $scope.commentKeydown = function($event, post) {
    if ($event.key === 'Enter') $scope.addComment(post);
  };

  // ─── Communities ──────────────────────────────────
  $scope.toggleJoin = function(comm) {
    if (!$scope.currentUser) {
      alert('Please log in to join communities.');
      return;
    }
    $http.post(API_BASE + '/communities/' + comm._id + '/join').then(res => {
      comm.joined = res.data.joined;
      comm.members = res.data.memberCount;
    });
  };

  // ─── UI helpers ──────────────────────────────────
  $scope.openSignup = function() { $scope.modalMode = 'signup'; $scope.modalActive = true; };
  $scope.openLogin = function() { $scope.modalMode = 'login'; $scope.modalActive = true; };
  $scope.openProfile = function() {
    if ($scope.currentUser) {
      $scope.modalMode = 'profile';
      $scope.modalActive = true;
    } else {
      $scope.openLogin();
    }
  };
  $scope.closeModal = function() { $scope.modalActive = false; };
  $scope.switchModal = function(mode) { $scope.modalMode = mode; };

  $scope.togglePassword = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const type = el.getAttribute('type') === 'password' ? 'text' : 'password';
    el.setAttribute('type', type);
    const icon = el.parentElement.querySelector('.fa-eye, .fa-eye-slash');
    if (icon) icon.classList.toggle('fa-eye');
  };

  // ─── Periodic refresh ──────────────────────────
  $interval(() => { loadFeed(); }, 30000);

  // ─── Intercept external links ────────────────────
  function handleLinkClick(e) {
    const target = e.target.closest('a');
    if (!target) return;
    const href = target.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      if (target.closest('.sc-posts') || target.closest('.sc-post-content')) {
        e.preventDefault();
        $scope.openLinkModal(href);
        if (!$scope.$$phase && !$scope.$$destroyed) $scope.$apply();
      }
    }
  }

  $document.on('click', handleLinkClick);
  $scope.$on('$destroy', function() { $document.off('click', handleLinkClick); });

});

// ─── Footer toggle ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  let lastScrollY = window.scrollY;
  let scrollTimeout;
  function handleScroll() {
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      footer.classList.add('visible');
    } else if (currentScrollY < lastScrollY) {
      if (!footer.matches(':hover')) footer.classList.remove('visible');
    }
    if (currentScrollY + windowHeight >= documentHeight - 100) {
      footer.classList.add('visible');
    }
    lastScrollY = currentScrollY;
  }
  window.addEventListener('scroll', function() {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => { handleScroll(); scrollTimeout = null; }, 100);
  });
  footer.classList.remove('visible');
});