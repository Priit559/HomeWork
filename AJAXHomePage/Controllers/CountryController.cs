using AJAXHomePage.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AJAXHomePage.Controllers
{
    public class CountryController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CountryController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var customers = await _context.Customers
                .Include(c => c.Country)
                .Include(c => c.City)
                .OrderBy(c => c.Country.Name)
                .ToListAsync();

            return View(customers);
        }
    }
}