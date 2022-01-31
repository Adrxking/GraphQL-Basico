import { Post, Prisma } from "@prisma/client";
import { Context } from "../index"

interface PostArgs {
    post: {
        title?:      string
        content?:    string
    }
}

interface PostPayloadType {
    userErrors: {
        message: string
    }[],
    post: Post | Prisma.Prisma__PostClient<Post> | null
}

export const Mutation = {
    postCreate: async (
        _: any, 
        { post }: PostArgs, 
        { prisma }: Context
        ): Promise<PostPayloadType> => {

            const { title, content } = post
            
            if(!title || !content) {
                return {
                    userErrors: [{
                        message: "Debes introducir un titulo y contenido para crear el post"
                    }],
                    post: null
                }
            }

            return {
                userErrors: [],
                post: prisma.post.create({
                    data: {
                        title,
                        content,
                        authorId: 1
                    }
                })
            }
    },
    postUpdate: async (
        _: any,
        { postId, post }: { postId: string, post: PostArgs["post"] },
        { prisma }: Context
    ) => {
        const { title, content } = post

        if(!title && !content) {
            return {
                userErrors: [
                    {
                        message: "Debes introducir por lo menos un campo"
                    }
                ],
                post: null
            }
        }

        // Comprobar que existe el post
        const existingPost = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })

        if(!existingPost) {
            return {
                userErrors: [
                    {
                        message: "No existe el post"
                    }
                ],
                post: null
            }
        }

        // Guardamos lo que el usuario quiere actualizar en una variable
        let payloadToUpdate = {
            title, 
            content
        }

        // Si el cliente no introduce el titulo o el contenido lo eliminamos del payload para no sobreescribir con null
        if(!title) delete payloadToUpdate.title
        if(!content) delete payloadToUpdate.content

        return {
            userErrors: [],
            post: prisma.post.update({
                data: {
                    ...payloadToUpdate
                },
                where: {
                    id: Number(postId)
                }
            })
        }

    },
    postDelete: async (
        _: any,
        { postId }: { postId: string },
        { prisma }: Context
    ): Promise<PostPayloadType> => {

        // Comprobar que existe el post
        const post = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })

        if(!post) {
            return {
                userErrors: [
                    {
                        message: "No existe el post"
                    }
                ],
                post: null
            }
        }

        // Eliminar el POST
        await prisma.post.delete({
            where: {
                id: Number(postId)
            }
        });

        return {
            userErrors: [],
            post
        }

    },
}