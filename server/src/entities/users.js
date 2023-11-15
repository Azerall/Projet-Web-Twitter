const bcrypt = require("bcrypt");
const { ObjectId } = require('mongodb');

class Users {
  constructor(db) {
    this.db = db;
    this.collection = db.collection("users");
  }

  async create(login, password, lastname, firstname, email) {
    try {
      const hash =await bcrypt.hash(password, 10);
      const result = await this.collection.insertOne({
        login: login,
        password: hash,
        lastname: lastname,
        firstname: firstname,
        email: email,
        description: `Je suis ${firstname} ${lastname}, ravi.e de vous rencontrer !`,
        followers: [],
        followings: [],
        profil_picture: "default.png",
      });
      return result.insertedId;
    } catch (err) {
      console.error("Erreur create user", err);
      throw err;
    }
  }

  async get(userid) {
    try {
      const result = await this.collection.findOne({
        _id: new ObjectId(userid),
      });
      return result;
    } catch (err) {
      console.error("Erreur get user", err);
      throw err;
    }
  }

  async delete(userid) {
    try {
      const result = await this.collection.deleteOne({ 
        _id: new ObjectId(userid),
      });
      return result;
    } catch (err) {
      console.error("Erreur delete user", err);
      throw err;
    }
  }

  async exists(login) {
    const count = await this.collection.countDocuments({ login });
    return count > 0;
  }

  async checkpassword(login, password, hash) {
    try {
      const result = await this.collection.findOne({
        login: login,
      });
      let pass = false;
      if (result){
        pass = await bcrypt.compare(password, result.password);
      }
      return pass ? result._id.toString() : null;
    } catch (err) {
      console.error("Erreur checkpassword", err);
      throw err;
    }
  }

  async addFollow(userid, followid) {
    try {
      const user = await this.get(userid);
      if (!user) {
        throw new Error("User ${userid} inconnu");
      }
      const followUser = await this.get(followid);
      if (!followUser) {
        throw new Error("User ${followid} inconnu");
      }

      await this.collection.updateOne(
        { _id: new ObjectId(userid) },
        { $addToSet: { followings: new ObjectId(followid) } }
      );
      await this.collection.updateOne(
        { _id: new ObjectId(followid) },
        { $addToSet: { followers: new ObjectId(userid) } }
      );
      return true;
    } catch (err) {
      console.error(`Erreur dans l'ajout de l'user ${followid} dans la liste des followers de ${userid}:`, err);
      throw err;
    }
  }

  async deleteFollow(userid, followid) {
    try {
      const user = await this.get(userid);
      if (!user) {
        throw new Error("User ${userid} inconnu");
      }
      const followUser = await this.get(followid);
      if (!followUser) {
        throw new Error("User ${followid} inconnu");
      }

      await this.collection.updateOne(
        { _id: new ObjectId(userid) },
        { $pull: { followings: new ObjectId(followid) } }
      );
      await this.collection.updateOne(
        { _id: new ObjectId(followid) },
        { $pull: { followers: new ObjectId(userid) } }
      );
      return true;
    } catch (err) {
      console.error(`Erreur dans l'ajout de l'user ${followid} dans la liste des followers de ${userid}:`, err);
      throw err;
    }
  }

  async getListFollowers(userid) {
    try {
      const user = await this.get(userid);
      if (!user) {
        throw new Error("User ${userid} inconnu");
      }
      const followersid = user.followers.map((followerid) => new ObjectId(followerid));
      const followers = await this.collection.find({ _id: { $in: followersid } }).toArray();
      return followers;
    } catch (err) {
      console.error("Erreur get message", err);
      throw err;
    }
  }

  async getListFollowings(userid) {
    try {
      const user = await this.get(userid);
      if (!user) {
        throw new Error("User ${userid} inconnu");
      }
      const followingsid = user.followings.map((followingid) => new ObjectId(followingid));
      const followings = await this.collection.find({ _id: { $in: followingsid } }).toArray();
      return followings;
    } catch (err) {
      console.error("Erreur get message", err);
      throw err;
    }
  }

  async editUser(userid, lastname, firstname, email, description, profil_picture) {
    try {
      console.log(userid, lastname, firstname, email, description, profil_picture);
      const result = await this.collection.updateOne(
        { _id: new ObjectId(userid) },
        { $set: { 
          lastname: lastname,
          firstname: firstname,
          email: email,
          description: description,
          profil_picture: profil_picture
        } }
      );
      return result;
    } catch (err) {
      console.error("Erreur edit user", err);
      throw err;
    }
  }

  async changeUser(userid, login, password) {
    try {
      const hash = await bcrypt.hash(password, 10);
      const result = await this.collection.updateOne(
        { _id: new ObjectId(userid) },
        { $set: { 
          login: login,
          password: hash,
        } }
      );
      return result;
    } catch (err) {
      console.error("Erreur change user", err);
      throw err;
    }
  }

  async search(searchText) {
    try {
      if (!searchText) {
        const results = await this.collection.find({}).toArray();
        return results;
      }
      const regex = new RegExp(searchText, "i");
      const results = await this.collection.find({
        $or: [
          { firstname: regex },
          { lastname: regex },
        ],
      }).toArray();
      return results;
    } catch (err) {
      console.error("Erreur recherche utilisateur", err);
      throw err;
    }
  }

  async topUsers(){

    try {
      const users = await this.collection.find({}).toArray();

      const nbUsers = await this.collection.find({}).count();
      
      if (nbUsers <= 3){
        return users;
      } 

      var top = [users[0], users[1], users[2]];
      if (top[0].followers.length < top[1].followers.length){
        top[0] = top[1];
        top[1] = users[0];
      }
      if (top[1].followers.length < top[2].followers.length){
        top[1] = top[2];
        top[2] = users[1];
      }
      if (top[0].followers.length < top[1].followers.length){
        top[0] = top[1];
        top[1] = users[0];
      }

      for (let index = 3; index < users.length; index++) {
        if (top[0].followers.length < users[index].followers.length){
          top[2] = top[1];
          top[1] = top[0];
          top[0] = users[index];
        }
        else if (top[1].followers.length < users[index].followers.length){
          top[2] = top[1];
          top[1] = users[index];
        }
        else if (top[2].followers.length < users[index].followers.length){
          top[2] = users[index];
        }
      }
      return top;

    } catch (error) {
        console.error("Erreur top Users", error);
        throw error;
    }

  }

}

exports.default = Users;