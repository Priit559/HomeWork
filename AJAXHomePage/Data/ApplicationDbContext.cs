using Microsoft.EntityFrameworkCore;
using AJAXHomePage.Models;

namespace AJAXHomePage.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Country> Countries { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Customer relationships
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Country)
                .WithMany()
                .HasForeignKey(c => c.CountryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Customer>()
                .HasOne(c => c.City)
                .WithMany(c => c.Customers)
                .HasForeignKey(c => c.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed data remains the same
            modelBuilder.Entity<Country>().HasData(
                new Country { Id = 1, Code = "USA", Name = "United States" },
                new Country { Id = 2, Code = "CAN", Name = "Canada" },
                new Country { Id = 3, Code = "GBR", Name = "United Kingdom" },
                new Country { Id = 4, Code = "AUS", Name = "Australia" },
                new Country { Id = 5, Code = "IND", Name = "India" },
                new Country { Id = 6, Code = "GER", Name = "Germany" },
                new Country { Id = 7, Code = "FRA", Name = "France" },
                new Country { Id = 8, Code = "ITA", Name = "Italy" },
                new Country { Id = 9, Code = "ESP", Name = "Spain" },
                new Country { Id = 10, Code = "EST", Name = "Estonia" }
            );

            modelBuilder.Entity<City>().HasData(
                new City { Id = 1, Code = "NYC", Name = "New York", CountryId = 1 },
                new City { Id = 2, Code = "LAX", Name = "Los Angeles", CountryId = 1 },
                new City { Id = 3, Code = "TOR", Name = "Toronto", CountryId = 2 },
                new City { Id = 4, Code = "VAN", Name = "Vancouver", CountryId = 2 },
                new City { Id = 5, Code = "LON", Name = "London", CountryId = 3 },
                new City { Id = 6, Code = "MAN", Name = "Manchester", CountryId = 3 },
                new City { Id = 7, Code = "SYD", Name = "Sydney", CountryId = 4 },
                new City { Id = 8, Code = "MEL", Name = "Melbourne", CountryId = 4 },
                new City { Id = 9, Code = "MUM", Name = "Mumbai", CountryId = 5 },
                new City { Id = 10, Code = "DEL", Name = "Delhi", CountryId = 5 },
                new City { Id = 11, Code = "BER", Name = "Berlin", CountryId = 6 },
                new City { Id = 12, Code = "MUN", Name = "Munich", CountryId = 6 },
                new City { Id = 13, Code = "PAR", Name = "Paris", CountryId = 7 },
                new City { Id = 14, Code = "MAR", Name = "Marseille", CountryId = 7 },
                new City { Id = 15, Code = "ROM", Name = "Rome", CountryId = 8 },
                new City { Id = 16, Code = "MIL", Name = "Milan", CountryId = 8 },
                new City { Id = 17, Code = "MAD", Name = "Madrid", CountryId = 9 },
                new City { Id = 18, Code = "BAR", Name = "Barcelona", CountryId = 9 },
                new City { Id = 19, Code = "TAL", Name = "Tallinn", CountryId = 10 },
                new City { Id = 20, Code = "TAR", Name = "Tartu", CountryId = 10 }
               
            );
        }
    }
}