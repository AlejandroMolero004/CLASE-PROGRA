	import{MongoClient}from "mongodb"
	import{ApolloServer}from "@apollo/server"
	import{startStandaloneServer}from "npm:@apollo/server@4.1/standalone"
  	import { authordb, bookdb } from "./types.ts";
	const MONGO_URL=Deno.env.get("MONGO_URL")

	if(!MONGO_URL){
	console.log("url is not set")
	Deno.exit(0)
	}

	const client=new MongoClient(MONGO_URL)
	await client.connect()
	const db=client.db("")
	const bookcollection=db.collection<bookdb>("")
	const authorscollection=db.collection<authordb>("")

	const schema=`#graphql
	type Book{
		id:ID!
		titulo:String
		autores:[Author!]!
		numAutores:Int!
	}
	type Author{
		id:ID!
		nombre:String!
		libros:[Book!]!
		numLibros:Int!
	}
	type Query{
		books:[Book!]!
		book:(id:ID!):Book
	}
	type Mutation{
		addBook:(titulo:String,autores:[ID!]!):Book!
	}

	`;
	const resolvers={
	Query:{
		books:async(_:unknown,__:unknown):Promise<bookdb[]>=>{
			return await bookcollection.find().toArray()
		}
	},
	Mutation:{

	},
	//como calculas la devolucion de cada campo
	Book:{
		id:(parent:bookdb,_:unknown)=>{
			return parent._id!.toString()
		},
		autores:async (parent:bookdb,_:unknown):Promise<authordb[]>=>{
			const ids=parent.autores;
			const autores=await authorscollection.find({_id:{$in: ids}}).toArray()
			return autores
		},
		numAutores:(parent:bookdb)=>{
			return parent.autores.length
		}
	},
	Author:{
		id: (parent:authordb)=> parent._id!.toString(),
		books:async(parent:authordb,_:unknown):Promise<bookdb[]>=>{
			return await bookcollection.find({autores:parent._id}).toArray()
		},
		numLibros: async(parent:authordb,_:unknown):Promise<number>=>{
			return (await bookcollection.find({autores:parent._id}).toArray()).length
		}
	}
	}

	const server=new ApolloServer({
	typeDefs:schema,resolvers
	})
	const{url}=await startStandaloneServer(server,{listen:4000})
	console.log(url)
