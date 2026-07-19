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
    return $sce.trustAsHtml(html);
  };
}]);

app.filter('youtubeEmbed', ['$sce', function($sce) {
  return function(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + match[2]);
    }
    return '';
  };
}]);

app.controller('ScrollCityCtrl', function($scope, $http, $interval) {

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://scroll-city.onrender.com/api';

  console.log('🌐 API_BASE =', API_BASE);

  const token = localStorage.getItem('token');
  if (token) {
    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    console.log('🔑 Token found in localStorage');
  }

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

  if (token) {
    $http.get(API_BASE + '/auth/me').then(res => {
      $scope.currentUser = res.data;
      console.log('👤 User loaded:', $scope.currentUser);
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

  // ─── AUTH with logging ────────────────────────────

  $scope.submitSignup = function() {
    console.log('🔵 Signup button clicked');
    const data = $scope.signupData;
    console.log('📦 Signup data:', data);
    if (!data.name || !data.email || !data.username || !data.password) {
      alert('Please fill in all fields.');
      return;
    }
    if (data.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    console.log('📡 Sending signup request to:', API_BASE + '/auth/signup');
    $http.post(API_BASE + '/auth/signup', data)
      .then(res => {
        console.log('✅ Signup success:', res.data);
        const result = res.data;
        localStorage.setItem('token', result.token);
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.token;
        $scope.currentUser = result.user;
        $scope.closeModal();
        $scope.signupData = { name: '', email: '', username: '', password: '' };
        loadFeed();
        alert('Welcome ' + result.user.name + '!');
      })
      .catch(err => {
        console.error('❌ Signup error:', err);
        const msg = err.data?.error || err.statusText || 'Signup failed';
        alert(msg);
      });
  };

  $scope.submitLogin = function() {
    console.log('🔵 Login button clicked');
    const data = $scope.loginData;
    console.log('📦 Login data:', data);
    if (!data.identifier || !data.password) {
      alert('Please enter your email/username and password.');
      return;
    }
    console.log('📡 Sending login request to:', API_BASE + '/auth/login');
    $http.post(API_BASE + '/auth/login', data)
      .then(res => {
        console.log('✅ Login success:', res.data);
        const result = res.data;
        localStorage.setItem('token', result.token);
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.token;
        $scope.currentUser = result.user;
        $scope.closeModal();
        $scope.loginData = { identifier: '', password: '' };
        loadFeed();
        alert('Welcome back ' + result.user.name + '!');
      })
      .catch(err => {
        console.error('❌ Login error:', err);
        const msg = err.data?.error || err.statusText || 'Login failed';
        alert(msg);
      });
  };

  $scope.logout = function() {
    localStorage.removeItem('token');
    delete $http.defaults.headers.common['Authorization'];
    $scope.currentUser = null;
    $scope.notificationCount = 0;
    loadFeed();
    console.log('👋 Logged out');
  };

  // ─── Posts ──────────────────────────────────────

  $scope.submitPost = function() {
    if (!$scope.currentUser) {
      alert('Please log in first.');
      return;
    }
    if (!$scope.newPost.content) return;
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

  // ─── Communities ──────────────────────────────

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

  // ─── UI helpers ──────────────────────────────

  $scope.setFeed = function(feed) {
    document.querySelectorAll('.sc-nav-item').forEach(el => el.classList.remove('active'));
    const items = document.querySelectorAll('.sc-nav-item');
    const idx = ['home', 'explore', 'communities', 'notifications', 'profile'].indexOf(feed);
    if (idx >= 0 && items[idx]) items[idx].classList.add('active');
  };

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

  $interval(() => {
    loadFeed();
  }, 30000);
});