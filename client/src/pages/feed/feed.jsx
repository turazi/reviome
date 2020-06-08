import React, { useEffect, Fragment } from 'react';
import { withRouter, useRouteMatch } from 'react-router-dom';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import {
  getFeed,
  getSavedPosts,
  getPostsByUser,
  getSavedPostsByUser,
  resetPosts,
} from './../../redux/actions/posts';

import PostForm from './../../components/post/post-form';
import PostItem from '../../components/post/post-item';
import Spinner from '../../components/spinner/spinner';

import debounce from 'lodash.debounce';

const Feed = ({
  getFeed,
  getSavedPosts,
  getPostsByUser,
  getSavedPostsByUser,
  resetPosts,
  pageType,
  userId,
  auth: { user },
  posts: { posts, loading, page, nextPage, errors },
  match,
}) => {
  // we only want useEffect to fire when nav link for feed has been clicked
  useEffect(() => {
    resetPosts();
    if (pageType === 'feed') {
      getFeed(page);
    } else if (pageType === 'favorites') {
      getSavedPosts(page);
    } else if (pageType === 'profilePosts') {
      getPostsByUser(page, userId);
    } else if (pageType === 'profileFavorites') {
      getSavedPostsByUser(page, userId);
    }
  }, []);

  window.onscroll = debounce(() => {
    // when users scroll, if the inner height is smaller than the window height we still call get feed
    if (
      window.innerHeight + window.scrollY >= document.body.scrollHeight &&
      nextPage
    ) {
      if (loading || errors.length > 0) return;
      if (pageType === 'feed') {
        getFeed();
      } else if (pageType === 'favorites') {
        getSavedPosts();
      } else if (pageType === 'profilePosts') {
        getPostsByUser(page, userId);
      } else if (pageType === 'profileFavorites') {
        getSavedPostsByUser(page, userId);
      }
    }
  }, 100);

  const handlePopup = (e) => {
    const popup = document.querySelector('#popup');
    const popupContent = document.querySelector('#popupContent');
    popup.style.opacity = '1';
    popup.style.visibility = 'visible';
    // popupContent.opacity = "1";
    // popupContent.transform = "translate(-50%, -50%) scale(1)";
  };

  return loading ? (
    <Spinner />
  ) : (
    <div className="section__container posts__container">
      {pageType === 'feed' && (
        <div className="posts__container--form">
          <img src={user.photo} alt={user.fullName} />
          <div className="input__btn" onClick={handlePopup}>
            Create a post
          </div>
          <PostForm />
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <div>No posts here. Please check out the explore page!</div>
      ) : (
        posts.map((post) => <PostItem key={post._id} post={post} />)
      )}
      {posts.length > 0 && !nextPage && (
        <div className="posts__container--end"> No more posts</div>
      )}
    </div>
  );
};

Feed.propTypes = {
  auth: PropTypes.object.isRequired,
  posts: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  getFeed: PropTypes.func.isRequired,
  getSavedPosts: PropTypes.func.isRequired,
  getPostsByUser: PropTypes.func.isRequired,
  getSavedPostsByUser: PropTypes.func.isRequired,
  resetPosts: PropTypes.func,
  pageType: PropTypes.string,
  userId: PropTypes.string,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  posts: state.posts,
  categories: state.categories,
});

export default connect(mapStateToProps, {
  getFeed,
  getSavedPosts,
  getPostsByUser,
  getSavedPostsByUser,
  resetPosts,
})(withRouter(Feed));
