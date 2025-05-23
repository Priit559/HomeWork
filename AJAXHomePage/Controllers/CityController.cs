using AJAXHomePage.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AJAXHomePage.Controllers
{
    public class CityController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CityController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var customers = await _context.Customers
                .Include(c => c.Country)
                .Include(c => c.City)
                .AsNoTracking() 
                .OrderBy(c => c.City.Name)
                .ToListAsync();

            return View(customers);
        }
    }
}