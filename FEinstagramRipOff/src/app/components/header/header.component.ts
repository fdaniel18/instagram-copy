import { Component, EventEmitter, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import type { User } from "../../models/user.model"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  @Output() createPost = new EventEmitter<void>()
  currentUser: User | null = null

  constructor(
    public router: Router,
    private authService: AuthService,
  ) {
    this.currentUser = this.authService.currentUserValue
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user
    })
  }

  onCreatePost(): void {
    if (this.currentUser) {
      this.createPost.emit()
    } else {
      this.router.navigate(["/login"])
    }
  }

  onAdminClick(): void {
    if (this.currentUser?.role === "ADMIN") {
      this.router.navigate(["/admin"])
    }
  }

  onProfileClick(): void {
    this.router.navigate(["/profile"])
  }

  onSignOut(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  onLoginClick(): void {
    this.router.navigate(["/login"])
  }

  onLogoClick(): void {
    this.router.navigate(["/posts"])
  }
}
