const express = require('express');
const postsRouter = express.Router();
const { requireUser } = require('./utils');
const { getAllPosts, createPost, updatePost, getPostById } = require("../db");



postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next(); 
});

// final part

postsRouter.post("/", requireUser, async (req, res, next) => {
	const { title, content, tags = "" } = req.body;

	const tagArr = tags.trim().split(/\s+/);
	// req.user is entire user object

	const authorId = req.user.id;
	const postData = { authorId, title, content, tagArr };

	// only send the tags if there are some to send
	if (tagArr.length) {
		postData.tags = tagArr;
	}

	try {
		const post = await createPost(postData);
		console.log("This is the post", post);
		res.send({ post });

		// add authorId, title, content to postData object
		// const post = await createPost(postData);
		// this will create the post and the tags for us
		// if the post comes back, res.send({ post });
		// otherwise, next an appropriate error object
	} catch ({ name, message }) {
		next({ name, message });
	}
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
	const { postId } = req.params;
	const { title, content, tags } = req.body;

	const updateFields = {};

	if (tags && tags.length > 0) {
		updateFields.tags = tags.trim().split(/\s+/);
	}

	if (title) {
		updateFields.title = title;
	}

	if (content) {
		updateFields.content = content;
	}

	try {
		const originalPost = await getPostById(postId);

		if (originalPost.author.id === req.user.id) {
			const updatedPost = await updatePost(postId, updateFields);
			res.send({ post: updatedPost });
		} else {
			next({
				name: "UnauthorizedUserError",
				message: "You cannot update a post that is not yours",
			});
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

//deleting the post - changing active to false so we can filter out
postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
	try {
		const post = await getPostById(req.params.postId);

		if (post && post.author.id === req.user.id) {
			const updatedPost = await updatePost(post.id, { active: false });

			res.send({ post: updatedPost });
		} else {
			// if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
			next(
				post
					? {
							name: "UnauthorizedUserError",
							message: "You cannot delete a post which is not yours",
					  }
					: {
							name: "PostNotFoundError",
							message: "That post does not exist",
					  }
			);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

//filter out the active:false
postsRouter.get("/", async (req, res, next) => {
	try {
		const allPosts = await getAllPosts();

		const posts = allPosts.filter((post) => {
			// keep a post if it is either active, or if it belongs to the current user
			return post.active || (req.user && post.author.id === req.user.id);
			// return a post with active =true, OR (even if post is not active) return a post if there is a curent user and the author id of the post
			//equals the active user object id
		});

		res.send({
			posts,
		});
	} catch ({ name, message }) {
		next({ name: "No posts error", message: "No posts under requested user" });
	}
});


postsRouter.post('/', requireUser, async (req, res, next) => {
  res.send({ message: 'under construction' });
});

postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

  res.send({
    posts
  });
});

module.exports = postsRouter;




