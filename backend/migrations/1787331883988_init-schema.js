exports.up = (pgm) => {
  // Enable the UUID extension for generating primary keys
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    google_id: { type: 'varchar(255)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('movies', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    title: { type: 'varchar(255)', notNull: true },
    poster_url: { type: 'varchar(255)' },
    showtime: { type: 'timestamp', notNull: true },
  });

  // Create an ENUM type for seat status so the database strictly enforces these three words
  pgm.createType('seat_status', ['AVAILABLE', 'RESERVED', 'BOOKED']);

  pgm.createTable('seats', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    movie_id: { type: 'uuid', notNull: true, references: '"movies"' },
    seat_number: { type: 'varchar(10)', notNull: true },
    status: { type: 'seat_status', notNull: true, default: 'AVAILABLE' },
  });

  // Create an ENUM type for booking status
  pgm.createType('booking_status', ['PENDING_OTP', 'CONFIRMED', 'FAILED']);

  pgm.createTable('bookings', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true, references: '"users"' },
    seat_id: { type: 'uuid', notNull: true, references: '"seats"' },
    status: { type: 'booking_status', notNull: true, default: 'PENDING_OTP' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('otp_verifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    booking_id: { type: 'uuid', notNull: true, references: '"bookings"' },
    otp_hash: { type: 'varchar(255)', notNull: true },
    expires_at: { type: 'timestamp', notNull: true },
  });
};

exports.down = (pgm) => {
  // If we make a mistake, this rolls the database back exactly how it was
  pgm.dropTable('otp_verifications');
  pgm.dropTable('bookings');
  pgm.dropType('booking_status');
  pgm.dropTable('seats');
  pgm.dropType('seat_status');
  pgm.dropTable('movies');
  pgm.dropTable('users');
};
