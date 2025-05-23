using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AJAXHomePage.Migrations
{
    /// <inheritdoc />
    public partial class FixCustomerCityRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Cities_CityId1",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_CityId1",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CityId1",
                table: "Customers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CityId1",
                table: "Customers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_CityId1",
                table: "Customers",
                column: "CityId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Cities_CityId1",
                table: "Customers",
                column: "CityId1",
                principalTable: "Cities",
                principalColumn: "Id");
        }
    }
}
