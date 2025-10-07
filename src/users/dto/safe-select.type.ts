export const safeSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

export const safeInclude = {
  id: true,
  name: true,
  email: true,
  username: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      bio: true,
      about: true,
      website: true,
      linkedIn: true,
      github: true,
    },
  },
  posts: {
    include: {
      title: true,
      thumbnail: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  },
  _count: {
    select: {
      followers: true,
      following: true,
    },
  },
};
