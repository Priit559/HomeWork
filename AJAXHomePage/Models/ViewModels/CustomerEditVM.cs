using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

namespace AJAXHomePage.Models.ViewModels
{
    public class CustomerEditVM
    {
        public int Id { get; set; }

        [Required]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }

        [Required]
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Display(Name = "Country")]
        public int CountryId { get; set; }
        public SelectList Countries { get; set; }

        [Required]
        [Display(Name = "City")]
        public int CityId { get; set; }
        public SelectList Cities { get; set; }

        [Display(Name = "Profile Image")]
        public IFormFile ProfileImage { get; set; }

        public string ExistingImagePath { get; set; }
    }
}