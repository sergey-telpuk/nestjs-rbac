_Role-based access control (RBAC) is a method of restricting network access based on the roles of individual users within an enterprise_

### Storage:
`roles` - array of roles, for isntnace, create two roles admin, user 
`permissions` - object of permissions with actions, for instance, create `post: ['create', 'update', 'delete']`
`grants` - there are assigned permissions to roles
`filters` - custom actions for permission.