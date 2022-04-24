const mongoose = require('mongoose');
const { DateTime } = require('luxon')

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

AuthorSchema
.virtual('name')
.get(function () {
    let fullname = ''
    if (this.first_name && this.family_name) {
        fullname = this.family_name + ', ' + this.first_name
    }
    if (!this.first_name || !this.family_name){
        fullname = ''
    }
    return fullname
});

AuthorSchema
.virtual('lifespan')
.get(function () {
    let fecha = ''
    if (this.date_of_birth) {
        fecha += DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATETIME_MED)
    }
    fecha += ' - '
    if (this.date_of_death) {
        fecha += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATETIME_MED)
    }
    return fecha
})

AuthorSchema
.virtual('url')
.get(function () {
    return '/catalog/author/' + this._id;
})


module.exports = mongoose.model('Author', AuthorSchema)