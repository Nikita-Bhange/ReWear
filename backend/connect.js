import mysql from "mysql2";
export const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root123',
    database :'secondhandstoredb'

})

db.connect((err)=>{
    if(err){
        console.log('error',err.message);
    }else{
        console.log('Database connected successfully')
    }
});

export default db;