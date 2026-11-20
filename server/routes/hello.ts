import { Elysia, t } from 'elysia'
import { betterAuth, protectedRoute } from '../protected-route'

export const hellorouter = new Elysia({ prefix: '/hello' })
.use(betterAuth)
    .get('/', () => {
        const hello = 'hello elysia'
        if(!hello){
            throw new Response( 'internal error', { status:500})
            //return status(500)
        }
        return {
            hello
        }
    })
    .post('/', ({ body }) => body, {
        body: t.Object({
            name: t.String()
        }),
        auth:true
    })