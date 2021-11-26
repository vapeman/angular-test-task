import { Component } from '@angular/core';
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  animations: [
    trigger('fadeInOutAnimation', [
      // state('transparent', style({opacity: '0.0',})),
      // state('notTransparent', style({opacity: '1.0',})),
      // transition('transparent <=> notTransparent', animate('0.9s ease')),
      transition('void => *', [
        style({opacity: 0, filter: 'blur(5px)'}),
        animate('.7s', style({opacity: 1, filter: 'none'}))
      ]),
      transition('* => void', [
        animate('.7s', style({opacity: 0, filter: 'blur(5px)'}))
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'angular-test-task';
}
