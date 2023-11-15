const { ObjectId } = require('mongodb');
const Users = require('./users.js');

class Messages {
  constructor(db) {
    this.db = db;
    this.messCollection = db.collection("messages");
    this.userCollection = db.collection("users");
    this.commCollection = db.collection("comments");
  }
  
  async create(authorid, text) {
    try {

      const user = await this.userCollection.findOne({
        _id: new ObjectId(authorid),
      });
      if (!user) {
        throw new Error(`User ${authorid} inconnu`);
      }

      if (text.length > 240){
        throw new Error(`Message supérieur à 240 caractères.`);
      }

      const result = await this.messCollection.insertOne({
        authorid: new ObjectId(authorid),
        date: new Date(),
        text: text,
        likers : [],
        comments : [],
      });
      return result.insertedId;
    } catch (err) {
        console.error("Erreur create message", err);
        throw err;
    }
  }

  async get(messageid) {
    try {
      const result = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!result) {
        throw new Error(`Message ${messageid} inconnu`);
      }
      return result;
    } catch (err) {
        console.error("Erreur get message", err);
        throw err;
    }
  }

  async set(authorid, messageid, text){
    try {

      const user = await this.userCollection.findOne({
        _id: new ObjectId(authorid),
      });
      if (!user) {
        throw new Error(`User ${authorid} inconnu`);
      }

      const message = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!message) {
        throw new Error(`Message ${messageid} inconnu`);
      }

      if (message.authorid != authorid){
        throw new Error(`User ${authorid} essaie de modifier un message qui n'est pas le sien !`);
      }

      const result = await this.messCollection.updateOne(
        { _id: new ObjectId(messageid)},
        { $set: { text: text }},
      );
      return result;
    } catch (err) {
        console.error("Erreur set message", err);
        throw err;
    }
  }

  async delete(authorid, messageid){
    try {

      const user = await this.userCollection.findOne({
        _id: new ObjectId(authorid),
      });
      if (!user) {
        throw new Error(`User ${authorid} inconnu`);
      }

      const message = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!message) {
        throw new Error(`Message ${messageid} inconnu`);
      }

      if (message.authorid != authorid){
        throw new Error(`User ${authorid} essaie de supprimer un message qui n'est pas le sien !`);
      }

      for (let index = 0; index < message.comments.length; index++) {
        const element = message.comments[index];
        await this.commCollection.findOneAndDelete({
          _id: new ObjectId(element),
        });
      }

      await this.messCollection.findOneAndDelete({
        _id: new ObjectId(messageid),
      });
      return true;
    } catch (err) {
        console.error("Erreur delete message", err);
        throw err;
    }
  }

  async like(messageid, liker){
    try {

      const mess = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!mess) {
        throw new Error(`Message ${messageid} inconnu`);
      }

      const user = await this.userCollection.findOne({
        _id: new ObjectId(liker),
      });
      if (!user) {
        throw new Error(`User ${liker} inconnu`);
      }

      const result = await this.messCollection.updateOne(
        { _id: new ObjectId(messageid)},
        { $addToSet: { likers: new ObjectId(liker) } },
      );
      return result.length;
    } catch (err) {
        console.error("Erreur like message", err);
        throw err;
    }
  }

  async unlike(messageid, liker){
    try {

      const mess = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!mess) {
        throw new Error(`Message ${messageid} inconnu`);
      }

      const user = await this.userCollection.findOne({
        _id: new ObjectId(liker),
      });
      if (!user) {
        throw new Error(`User ${liker} inconnu`);
      }
      
      const result = await this.messCollection.updateOne(
        { _id: new ObjectId(messageid)},
        { $pull: { likers: new ObjectId(liker) } },
      );
      return result.length;
    } catch (err) {
        console.error("Erreur unlike message", err);
        throw err;
    }
  }

  async nbLikes(messageid){
    try {

      const mess = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!mess) {
        throw new Error(`Message ${messageid} inconnu`);
      }
      return mess.likers.length;
    } catch (err) {
        console.error("Erreur unlike message", err);
        throw err;
    }
  }

  async addComment(messageid, userid, text){
    try {

      const user = await this.userCollection.findOne({
        _id: new ObjectId(userid),
      });
      if (!user) {
        throw new Error(`User ${userid} inconnu`);
      }

      const message = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!message) {
        throw new Error(`Message ${messageid} inconnu`);
      }
      const comment = await this.commCollection.insertOne({
        authorid: new ObjectId(userid),
        messageid: new ObjectId(messageid),
        date: new Date(),
        text: text,
      });

      const result = await this.messCollection.updateOne(
        { _id: new ObjectId(messageid) },
        { $push: { comments: comment.insertedId } }
      );
      return result;
    } catch (err) {
        console.error("Erreur add comment", err);
        throw err;
    }
  }

  async getComments(messageid){
    try {

      const message = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!message) {
        throw new Error(`Message ${messageid} inconnu`);
      }

      const comm = message.comments.map((id) => new ObjectId(id));
      const result = await this.commCollection.find({ _id: { $in: comm } }).toArray();
      return result;
    } catch (err) {
        console.error("Erreur add comment", err);
        throw err;
    }
  }

  async deleteComment(messageid, userid, commentid){
    try {
      const user = await this.userCollection.findOne({
        _id: new ObjectId(userid),
      });
      if (!user) {
        throw new Error(`User ${userid} inconnu`);
      }

      const message = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!message) {
        throw new Error(`Message ${messageid} inconnu`);
      }

      const comment = await this.commCollection.findOne({
        _id: new ObjectId(commentid),
      });
      if (!comment) {
        throw new Error(`Comment ${commentid} inconnu`);
      }

      if (comment.messageid != messageid) {
        throw new Error (`Comment ${commentid} n'est pas un commentaire du message ${messageid}`)
      }

      if (comment.authorid != userid){
        throw new Error(`User ${userid} essaie de supprimer un commentaire qui n'est pas le sien !`);
      }
      
      const result = await this.messCollection.updateOne(
        { _id: new ObjectId(messageid) },
        { $pull: { comments : new ObjectId(commentid)} }
      );

      await this.commCollection.findOneAndDelete({
        _id: new ObjectId(commentid),
      });

      return result;

    } catch (err) {
        console.error("Erreur delete comment", err);
        throw err;
    }
  }

  async setComment(messageid, userid, commentid, text){
    try {
      const user = await this.userCollection.findOne({
        _id: new ObjectId(userid),
      });
      if (!user) {
        throw new Error(`User ${userid} inconnu`);
      }

      const message = await this.messCollection.findOne({
        _id: new ObjectId(messageid),
      });
      if (!message) {
        throw new Error(`Message ${messageid} inconnu`);
      }

      const comment = await this.commCollection.findOne({
        _id: new ObjectId(commentid),
      });
      if (!comment) {
        throw new Error(`Comment ${commentid} inconnu`);
      }

      if (comment.messageid != messageid) {
        throw new Error (`Comment ${commentid} n'est pas un commentaire du message ${messageid}`)
      }

      if (comment.authorid != userid){
        throw new Error(`User ${userid} essaie de modifier un commentaire qui n'est pas le sien !`);
      }
      
      const result = await this.commCollection.updateOne(
        { _id: new ObjectId(commentid) },
        { $set: { text : text} }
      );
      return result;

    } catch (err) {
        console.error("Erreur delete comment", err);
        throw err;
    }
  }

  async getListMessages() {
    try {
      const result = await this.messCollection.find({
      }).toArray();
      return result;
    } catch (err) {
        console.error("Erreur get list messages", err);
        throw err;
    }
  }

  async getListMessagesFromUser(authorid) {
    try {

      const user = await this.userCollection.findOne({
        _id: new ObjectId(authorid),
      });
      if (!user) {
        throw new Error(`User ${authorid} inconnu`);
      }

      const result = await this.messCollection.find({
        authorid: new ObjectId(authorid),
      }).toArray();
      return result;
    } catch (err) {
        console.error("Erreur get list messages from user", err);
        throw err;
    }
  }

  async getListMessagesFromFollowing(authorid) {
    try {  
      const user = await this.userCollection.findOne({
        _id: new ObjectId(authorid),
      });
      if (!user) {
        throw new Error(`User ${authorid} inconnu`);
      }
      const followingsid = user.followings.map((followingid) => new ObjectId(followingid));
      const result = await this.messCollection.find({ authorid: { $in: followingsid } }).toArray();
      const result2 = await this.messCollection.find({ authorid: new ObjectId(authorid) }).toArray();
      return result.concat(result2);
    } catch (err) {
        console.error("Erreur get list messages from followings", err);
        throw err;
    }
  }

  async MessageCountPerUser(userid){
    try {

      const user = await this.userCollection.findOne({
        _id: new ObjectId(userid),
      });
      if (!user) {
        throw new Error(`User ${userid} inconnu`);
      }

      const nbMessages = await this.messCollection.find({
        authorid: new ObjectId(userid),
      }).count();

      return nbMessages;
    
    } catch (err) {
        console.error("Erreur nombre messages", err);
        throw err;
    }
  }

  async LikeCountPerUser(userid){
    try {

      const user = await this.userCollection.findOne({
        _id: new ObjectId(userid),
      });
      if (!user) {
        throw new Error(`User ${userid} inconnu`);
      }

      const messages = await this.messCollection.find({
        authorid: new ObjectId(userid),
      });

      var nbLikes = 0;

      await messages.forEach(element => {
        nbLikes += element.likers.length;
      });

      return nbLikes;
    
    } catch (err) {
        console.error("Erreur nombre likes", err);
        throw err;
    }
  }

  async trendings() {
    try {
      const messages = await this.messCollection.find({}).toArray();
      
      messages.sort((a, b) => b.likers.length - a.likers.length);
      
      const trendings = messages.slice(0, 3);
      
      return trendings;
    } catch (error) {
      console.error("Erreur trendings", error);
      throw error;
    }
  }
  

}


exports.default = Messages;
