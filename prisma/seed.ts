import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const default_seed = async () => {
    const no_of_users = 10;

    // ---- Helpers ----
    const fakePostData = async () => {
      const title = faker.lorem.sentence();
      const slug =
        faker.helpers.slugify(title).toLowerCase() +
        '-' +
        faker.number.int({ min: 1000, max: 9999 });

      return {
        slug,
        thumbnail: faker.image.urlPicsumPhotos(),
        content: faker.lorem.paragraphs({ min: 3, max: 8 }),
        title,
      };
    };

    const fakeUserData = async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName });
      const username = faker.internet.username({ firstName, lastName });
      const password = await bcrypt.hash(faker.internet.password(), 10);

      const post_per_user = faker.number.int({ min: 1, max: 5 });
      const posts = await Promise.all(Array.from({ length: post_per_user }, fakePostData));

      return {
        name: `${firstName} ${lastName}`,
        email,
        username,
        password,
        posts,
      };
    };

    // ---- Seed Users + Posts ----
    const users: any[] = [];
    for (let i = 0; i < no_of_users; i++) {
      const { posts, ...data } = await fakeUserData();
      const user = await prisma.user.upsert({
        where: { email: data.email },
        update: {},
        create: {
          ...data,
          posts: {
            create: posts,
          },
        },
        include: { posts: true },
      });
      users.push(user);
    }

    // ---- Seed Comments + Likes ----
    for (const user of users) {
      for (const post of user.posts) {
        // Random comments on each post
        const numComments = faker.number.int({ min: 0, max: 3 });
        for (let i = 0; i < numComments; i++) {
          const commenter = faker.helpers.arrayElement(users);
          await prisma.comment.create({
            data: {
              content: faker.lorem.sentence(),
              postId: post.id,
              authorId: commenter.id,
            },
          });
        }

        // Random likes on each post
        const numLikes = faker.number.int({ min: 0, max: 5 });
        const likers = faker.helpers.arrayElements(users, numLikes);
        for (const liker of likers) {
          await prisma.like.create({
            data: {
              postId: post.id,
              userId: liker.id,
            },
          });
        }
      }
    }

    for (const user of users) {
      const possibleFollows = users.filter(u => u.id !== user.id);
      const following = faker.helpers.arrayElements(
        possibleFollows,
        faker.number.int({ min: 0, max: 3 }),
      );

      for (const followee of following) {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: followee.id,
          },
        });
      }
    }

    console.log('✅ Database seeded with users, posts, comments, likes, followers');
  };

  const badgeSeed = async () => {
    const badges = await prisma.badge.findMany();
    if (badges.length > 0) return;

    const badgesData = [
      {
        name: 'First Post',
        description: 'Awarded for publishing your very first post',
        icon: '/badges/first-post.png',
      },
      {
        name: 'Contributor',
        description: 'Published 10 posts',
        icon: '/badges/contributor.png',
      },
      {
        name: 'Writer',
        description: 'Published 50 posts',
        icon: '/badges/writer.png',
      },
      {
        name: 'Popular Post',
        description: 'One of your posts received 100 likes',
        icon: '/badges/popular-post.png',
      },
      {
        name: 'Community Star',
        description: 'Your posts received 500 total likes',
        icon: '/badges/community-star.png',
      },
      {
        name: 'First Comment',
        description: 'Wrote your first comment',
        icon: '/badges/first-comment.png',
      },
      {
        name: 'Helpful',
        description: 'Wrote 50 comments',
        icon: '/badges/helpful.png',
      },
      {
        name: 'Supporter',
        description: 'Liked 20 posts',
        icon: '/badges/supporter.png',
      },
      {
        name: 'Early Bird',
        description: 'Joined within the first 30 days of launch',
        icon: '/badges/early-bird.png',
      },
      {
        name: 'Verified',
        description: 'Verified your email address',
        icon: '/badges/verified.png',
      },
    ];
    await prisma.badge.createMany({
      data: badgesData,
    });
  };
  
  const tagSeed = async () => {
    const tags = await prisma.tag.findMany();
    if (tags.length > 0) return;

    const tagsData = [
      {
        name: 'JavaScript',
        slug: 'javascript',
        about: 'All things JavaScript: tips, tricks, tutorials, and best practices.',
      },
      {
        name: 'TypeScript',
        slug: 'typescript',
        about: 'Typed JavaScript that scales — articles, guides, and patterns.',
      },
      {
        name: 'React',
        slug: 'react',
        about: 'React tutorials, hooks, state management, and ecosystem insights.',
      },
      {
        name: 'Next.js',
        slug: 'nextjs',
        about: 'Full-stack React framework for building modern web applications.',
      },
      {
        name: 'NestJS',
        slug: 'nestjs',
        about: 'Progressive Node.js framework for building scalable server-side apps.',
      },
      {
        name: 'Node.js',
        slug: 'nodejs',
        about: 'Backend development with Node.js and its ecosystem.',
      },
      {
        name: 'Prisma',
        slug: 'prisma',
        about: 'Modern database toolkit for TypeScript and Node.js.',
      },
      {
        name: 'PostgreSQL',
        slug: 'postgresql',
        about: 'Relational database tutorials, queries, optimization, and features.',
      },
      {
        name: 'CSS',
        slug: 'css',
        about: 'Styling techniques, animations, and responsive design tips.',
      },
      {
        name: 'DevOps',
        slug: 'devops',
        about: 'CI/CD, Docker, Kubernetes, and infrastructure as code.',
      },
      {
        name: 'APIs',
        slug: 'apis',
        about: 'REST, GraphQL, and API design best practices.',
      },
      {
        name: 'Databases',
        slug: 'databases',
        about: 'SQL, NoSQL, indexing, and database design.',
      },
      {
        name: 'Testing',
        slug: 'testing',
        about: 'Unit tests, integration tests, and testing strategies.',
      },
      {
        name: 'Open Source',
        slug: 'open-source',
        about: 'Contributing to and maintaining open-source projects.',
      },
      {
        name: 'Career',
        slug: 'career',
        about: "Tips, experiences, and advice for developers' career growth.",
      },
    ];

    await prisma.tag.createMany({
      data: tagsData,
    });
  };

  tagSeed();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
