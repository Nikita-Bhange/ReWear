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
    
  db.query("SHOW COLUMNS FROM `users`", (columnError, rows) => {
    if (columnError) {
      console.error("Failed to inspect register table:", columnError);
      return;
    }

    const hasVerifiedColumn = rows.some((column) => column.Field === "is_verified");
    const idColumn = rows.find((column) => column.Field === "id");

    if (!hasVerifiedColumn) {
      db.query(
        "ALTER TABLE `users` ADD COLUMN `is_verified` TINYINT(1) NOT NULL DEFAULT 0",
        (alterVerifiedError) => {
          if (alterVerifiedError) {
            console.error("Failed to add is_verified column:", alterVerifiedError);
            return;
          }

          console.log("Added missing is_verified column to register table");
        }
      );
    }

    if (!idColumn?.Extra?.includes("auto_increment")) {
      db.query(
        "ALTER TABLE `register` MODIFY `id` INT NOT NULL AUTO_INCREMENT",
        (alterIdError) => {
          if (alterIdError) {
            console.error("Failed to make id auto increment:", alterIdError);
            return;
          }

          console.log("Updated register.id to AUTO_INCREMENT");
        }
      );
    }
  });
});

export default db;

