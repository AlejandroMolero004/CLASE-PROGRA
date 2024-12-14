import { ObjectId } from "mongodb";

export type bookdb={
    _id?:ObjectId
    titulo:string
    autores:ObjectId[]
}

export type authordb={
    _id?:ObjectId
    nombre:string
}
export type book={
    id:string
    titulo:string
    autores:author[]
    numAutores:number
}
export type author={
    id:string
    name:string
    libros:book[]
    numLibros:number
}