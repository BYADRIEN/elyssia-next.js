import { db } from '@/src'
import { posts } from '@/src/db/schema'
import { betterAuth } from '../protected-route'
import { and, eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { createPostInsertSchema, updatePostInsertSchema } from '@/types/posts'
import { id } from 'date-fns/locale'

export const postsRouter = new Elysia({ prefix: '/posts' })
    .use(betterAuth)

    // GET /posts
    .get('/', async () => {
        const postsData = await db
            .select()
            .from(posts)
             if (!postsData) {
                return[]
            //throw new Response('Post not found', { status: 404 })
            }
        return postsData
    })

    // GET /posts/:id
    .get('/:id', async ({ params }) => {
        const { id } = params

        const [post] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))

        if (!post) { 
            return null
            //throw new Response('Post not found', { status: 404 })
        }

        return post
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // POST /posts
    .post('/', async ({ body, session }) => {
        const { name, content } = body
        const { id: userId } = session.user

        const [data] = await db
            .insert(posts)
            .values({
                name,
                content,
                userId,
            })
            .returning()
        if(!data){
        throw new Response('internal error' ,{ status:500})
        }
        return data
    }, {
        body: t.Omit(createPostInsertSchema,[
            "id",
            "userId",
            "createdAt",
            "updatedAt"
        ]),
        auth:true
    }).patch('/:id' , async ({params, body, session}) => {
        const {id} = params
        const {name, content} = body 
        const {id: userId} = session.user
        const [updatedPost] = await db.update(posts).set({
            name,
            content,
        }).where(and( eq(posts.id, id), eq(posts.userId,userId))).returning()
        if(!updatedPost){
        throw new Response('internal error' ,{ status:500})
        }
        return updatedPost
    }, 
    {
        body: t.Omit(updatePostInsertSchema,[
            "id",
            "userId",
            "createdAt",
            "updatedAt",
        ]),
        auth:true,
        params: t.Object({
            id: t.String()
        })
    }).delete('/:id', async ({params , session}) => {
        const {id} = params
        const {id: userId} = session.user
        const [deletedPost] = await db.delete(posts).where(and(eq(posts.id, id), eq (posts.userId,userId))).returning()
        if(!deletedPost){
        throw new Response('internal error' ,{ status:500})
        }
        return deletedPost
    } , {
        auth:true,
        params: t.Object({
            id: t.String()
        })
    })