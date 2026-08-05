import bcrypt from "bcryptjs";

async function generateHash() {

    const password = "Admin@123";

    const hash = await bcrypt.hash(password, 10);

    console.log("\nPassword:", password);
    console.log("\nHash:\n");
    console.log(hash);
}

generateHash();