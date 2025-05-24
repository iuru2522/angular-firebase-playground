
//This makes imports cleaner throughout your app
// Why this helps: Instead of writing:
// import { UserRole } from './models/user-role.enum';
// import { User } from './models/user.interface';
// it will be possible to do like this:
// import { UserRole, User } from './models';

export * from './user-role.enum';
export * from './user.interface';