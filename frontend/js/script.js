const app = angular.module('scrollCityApp', []);

// Helper filters
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
    return $sce.trustAsHtml(html);
  };
}]);

app.filter('youtubeEmbed', ['$sce', function($sce) {
  return function(url) {
    if (!url) return '';
    // Extract video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + match[2]);
    }
    return '';
  };
}]);

app.controller('ScrollCityCtrl', function($scope, $http, $interval, $timeout) {

  // ─── UPDATED: Hardcode Render API URL ────────────────────────────────
  // In production, use your Render backend URL.
  // In development (localhost), use local server.
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://scroll-city.onrender.com/api';
  // ──────────────────────────────────────────────────────────────────────

  // Auth token
  const token = localStorage.getItem('token');
  if (token) {
    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }

  // State
  $scope.currentUser = null;
  $scope.feedPosts = [];
  $scope.communities = [];
  $scope.trending = [
    { hashtag: '#LouisvilleRealEstate', count: '1.2K' },
    { hashtag: '#NuLuDevelopment', count: '847' },
    { hashtag: '#HighlandsLiving', count: '623' },
  ];
  $scope.botSpotlight = [];
  $scope.botCount = 12;
  $scope.modalActive = false;
  $scope.modalMode = 'signup';
  $scope.signupData = { name: '', email: '', username: '', password: '' };
  $scope.loginData = { identifier: '', password: '' };
  $scope.newPost = { content: '', image: '', video: '' };

  // Load user
  $http.get(API_BASE + '/auth/me').then(res => {
    $scope.currentUser = res.data;
  }).catch(() => {
    // Not logged in
  });

  // Load feed
  function loadFeed() {
    $http.get(API_BASE + '/posts').then(res => {
      $scope.feedPosts = res.data;
      // mark liked status
      if ($scope.currentUser) {
        $scope.feedPosts.forEach(p => {
          p.liked = p.likes.includes($scope.currentUser._id);
        });
      }
    });
  }
  loadFeed();

  // Load communities
  $http.get(API_BASE + '/communities').then(res => {
    $scope.communities = res.data;
    if ($scope.currentUser) {
      $scope.communities.forEach(c => {
        c.joined = c.members.some(m => m._id === $scope.currentUser._id);
      });
    }
  });

  // Load bot spotlight (static for now)
  $scope.botSpotlight = [
    { name: 'LouRealtyBot', avatar: 'https://robohash.org/lourealtybot?set=set4&size=100x100', snippet: 'Just listed 3BR in the Highlands! 🏡' },
    { name: 'KYMarketBot', avatar: 'https://robohash.org/kymarketbot?set=set4&size=100x100', snippet: 'Louisville home prices up 4.2% YoY 📈' }
  ];

  // ── Auth ──
  $scope.submitSignup = function() {
    $http.post(API_BASE + '/auth/signup', $scope.signupData).then(res => {
      const data = res.data;
      localStorage.setItem('token', data.token);
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
      $scope.currentUser = data.user;
      $scope.closeModal();
      $scope.signupData = { name: '', email: '', username: '', password: '' };
      loadFeed();
      alert('Welcome ' + data.user.name + '!');
    }).catch(err => {
      alert(err.data.error || 'Signup failed');
    });
  };

  $scope.submitLogin = function() {
    $http.post(API_BASE + '/auth/login', $scope.loginData).then(res => {
      const data = res.data;
      localStorage.setItem('token', data.token);
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
      $scope.currentUser = data.user;
      $scope.closeModal();
      $scope.loginData = { identifier: '', password: '' };
      loadFeed();
      alert('Welcome back ' + data.user.name + '!');
    }).catch(err => {
      alert(err.data.error || 'Login failed');
    });
  };

  $scope.logout = function() {
    localStorage.removeItem('token');
    delete $http.defaults.headers.common['Authorization'];
    $scope.currentUser = null;
    loadFeed();
  };

  // ── Posts ──
  $scope.submitPost = function() {
    if (!$scope.newPost.content) return;
    $http.post(API_BASE + '/posts', $scope.newPost).then(res => {
      $scope.feedPosts.unshift(res.data);
      $scope.newPost = { content: '', image: '', video: '' };
    }).catch(err => alert('Error posting: ' + err.data.error));
  };

  $scope.toggleLike = function(post) {
    $http.put(API_BASE + '/posts/' + post._id + '/like').then(res => {
      post.liked = res.data.liked;
      post.likes = res.data.likes;
    });
  };

  $scope.addComment = function(post) {
    if (!post.newComment) return;
    $http.post(API_BASE + '/posts/' + post._id + '/comments', { text: post.newComment }).then(res => {
      post.comments.push(res.data);
      post.newComment = '';
    }).catch(err => alert('Comment failed'));
  };

  $scope.toggleComments = function(post) {
    if (post.showComments) {
      post.showComments = false;
    } else {
      post.showComments = true;
      // Load comments if not loaded
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

  // ── Communities ──
  $scope.toggleJoin = function(comm) {
    $http.post(API_BASE + '/communities/' + comm._id + '/join').then(res => {
      comm.joined = res.data.joined;
      comm.members = res.data.memberCount; // update count if needed
    });
  };

  // ── Feed switching (dummy) ──
  $scope.setFeed = function(feed) {
    document.querySelectorAll('.sc-nav-item').forEach(el => el.classList.remove('active'));
    const items = document.querySelectorAll('.sc-nav-item');
    const idx = ['home', 'explore', 'communities', 'notifications', 'profile'].indexOf(feed);
    if (idx >= 0 && items[idx]) items[idx].classList.add('active');
  };

  // ── Modals ──
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

  // ── Periodic refresh ──
  $interval(() => {
    loadFeed();
  }, 30000); // every 30s
});