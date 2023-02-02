# Jakes Simple Model System

This is a very opinionated library/package to handle database models on the frontend with ease.
<br>

## How to use it?

In the following we will use a simple user model as our example.
The full example code can be found under src/models and src/collections

### How to define a model
To define a model just create a class like so:

```javascript
import { Model } from 'jsmsytem/traits'
import { defineModelConfig } from 'jsmsytem'

export class User {
    static attributes = ['id', 'name', 'email', 'created_at', 'updated_at', 'deleted_at']

    static init() {
        User.config = defineModelConfig({
            basePath: '/api/user',
        })
    }

    constructor(data) {
        Model.init(this, User, data)
    }

    static async create(data) {
        return await Model.create(data, User)
    }
}
```

To see which values can be set on config refer to src/models/defaults.js.<br>

At this stage we are basically done with implementing a very simple user model for us to use.
<br>

### Working with the model

<b>Creating a model:</b><br>
We will assume that the server endpoint for creating a new resource expects the name, email and password to be send.
```javascript
const user = await User.create({
    name: 'John Doe',
    email: jon.doe@email.com,
    password: 'password'
})
```

<b>Getting a model:</b><br>
To retrieve a user with the id '2' from the database:
```javascript
const user = await Model.get(2, User)
```

<b>Changing the model:</b></br>
In the background JSMS will define getters and setters for the attributes defined in the static class
property attributes.
To change an attribute of the user just change the property:
```javascript
user.name = 'Jane Doe'
```

This will not send an patch request to the backend yet. If we want to send the patch request and update the resource on the database:
```javascript
user.update()
```

If instead we want to reset the model to its initial state:
```javascript
user.reset()
```

<b>Deleting the model:</b></br>
If we want to delete the model:
```javascript
user.delete()
```
This will send a simple delete request to user.deletePath to the backend. If your resource is working with
soft deletion you can run:
```javascript
user.forceDelete()
```
This will also send a delete request but to user.forceDeletePath

### Defining relations on model
Normally a user has severel relations like its role or permissions.
The Relation-Trait helps us to work with related resources. It is expected, that you send the response from the backend as such:
```json
{
    "relations": {
        "permissions": [1,4,...],   // These are the keys of all related permissions
        "role": 2                   // This is the key of the related role
    }
}
```

If we want to work with relations on the model we have to implement the Relation-Trait like so:
```javascript
import { Model, Relation } from 'jsmsystem/traits'
import { defineModelConfig } from 'jsmsystem'
import { PermissionCollection } from '../collections/permissions'
import { Role } from './role'

export class User {
    static attributes = ['id', 'name', 'email', 'created_at', 'updated_at', 'deleted_at']

    static init() {
        User.config = defineModelConfig({
            basePath: '/api/user',
        })

        User.relations = {
            permissions: {
                type: 'collection',
                value: PermissionCollection,
            },
            role: {
                type: 'model',
                value: Role
            }
        }
    }

    constructor(data) {
        Model.init(this, User, data)
        Relation.init(this, User, data.relations)
    }

    static async create(data) {
        return await Model.create(data, User)
    }
}
```
To use the Relation-Trait we have to have implemented the Model-Trait.

<b>Fetch relations:</b></br>
When we fetch a relation the collection or model representing the relation will be filled with
the proper model(s).
Otherwise we will only have access to the keys provided by the response from the backend.

We want to only fetch the role relation from the user:
```javascript
user.fetchRelation('role')
```

We want to fetch all relations:
```javascript
user.fetchRelations()
```
The function fetchRelation also takes in an array of strings with the names of the relations to be fetched.

<b>Update relations:</b></br>
To update the relations:
```javascript
// Update role to 5
user.updateRelation('role', 5)

// Update role to 5 and change the permissions
user.updateRelations({
    relations: {
        role: 5,
        permissions: [2,3]
    }
})
```

### Serverside response
You have to serve the user resource or any resource in a specific format:
```json
{
    // This part will be used by the Model-Trait
    "attributes": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@email.com",
        "created_at": "01.01.2022",
        "updated_at": "02.01.2022",
        "deleted_at": "05.02.2022"
    },
    // This part is used by the Relation-Trait
    "relations": {
        "permissions": [1,2,3],
        "role": 1
    }
}
```
